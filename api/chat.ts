import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateUserSession } from '../lib/auth/validate-conjunto';
import { buildSystemPrompt } from '../lib/ai/system-instruction-builder';
import { callAI } from '../lib/ai/gemini-backend';
import { HIDDEN_TOOLS_SPEC, TOOL_IMPLEMENTATION_MAP } from '../lib/ai/occulted-tools';
import { executeToolLocally } from '../lib/ai/tool-executor';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // 1. Validate User Session via Authorization JWT
  const authHeader = req.headers.authorization;
  const session = await validateUserSession(authHeader);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { conjuntoId, fullName } = session;
  const { message, history, mode = 'chat' } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  try {
    // 2. Handle utility modes (no tools, simple generation)
    if (mode === 'generate-subject') {
      const prompt = `Genera un asunto corto y profesional para el siguiente correo electrónico:\n\n"${message}"\n\nAsunto:`;
      const aiResponse = await callAI(
        "Eres un asistente de redacción profesional.",
        prompt,
        [],
        []
      );
      res.status(200).json({ message: aiResponse.text?.trim() || '' });
      return;
    }

    if (mode === 'improve-writing') {
      const prompt = `Mejora la redacción del siguiente texto para que sea más claro, profesional y conciso, manteniendo el tono original. No agregues saludos ni despedidas, solo mejora el texto proporcionado:\n\n"${message}"`;
      const aiResponse = await callAI(
        "Eres un asistente de redacción profesional.",
        prompt,
        [],
        []
      );
      res.status(200).json({ message: aiResponse.text?.trim() || '' });
      return;
    }

    // 3. Chat mode (default) - Fetch conjunto info from database
    const { data: conjunto, error: conjuntoErr } = await supabaseAdmin
      .from('conjuntos')
      .select('name')
      .eq('id', conjuntoId)
      .single();

    if (conjuntoErr || !conjunto) {
      console.error('Error fetching conjunto info:', conjuntoErr);
      res.status(500).json({ error: 'Failed to fetch conjunto info' });
      return;
    }

    // 4. Fetch IA config (prompt, tone, etc) for this conjunto
    const { data: iaConfig, error: iaConfigErr } = await supabaseAdmin
      .from('ia_config')
      .select('system_prompt, tone')
      .eq('conjunto_id', conjuntoId)
      .maybeSingle();

    const customPrompt = iaConfig?.system_prompt || null;
    const tone = iaConfig?.tone || 'formal';

    // 5. Build system instruction
    const systemPrompt = buildSystemPrompt(conjunto.name, fullName, customPrompt, tone);

    // 6. Call AI with fallback
    const aiResponse = await callAI(systemPrompt, message, history || [], HIDDEN_TOOLS_SPEC);

    // 7. Record Token Usage in Database
    const { usageMetadata, provider, toolCalls } = aiResponse;
    const promptTokens = usageMetadata?.promptTokens || 0;
    const completionTokens = usageMetadata?.completionTokens || 0;
    
    // Estimate cost: Gemini 2.0 Flash is $0.075 / 1M input, $0.30 / 1M output
    const cost = (promptTokens * 0.000000075) + (completionTokens * 0.0000003);

    const executedTool = toolCalls && toolCalls.length > 0 ? toolCalls[0].name : 'none';

    // Log the interaction
    try {
      await supabaseAdmin.from('ia_usage').insert({
        conjunto_id: conjuntoId,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_cost: cost,
        model_used: provider === 'gemini' ? (process.env.GEMINI_MODEL || 'gemini-2.0-flash') : provider,
        executed_tool: executedTool
      });
    } catch (err) {
      console.warn('Failed to log IA usage:', err);
    }

    // 8. If AI requested a tool call, resolve the obfuscated name and execute locally
    if (toolCalls && toolCalls.length > 0) {
      const toolCall = toolCalls[0];
      const resolvedName = TOOL_IMPLEMENTATION_MAP[toolCall.name] || toolCall.name;
      const toolResult = await executeToolLocally(resolvedName, toolCall.args, conjuntoId);
      
      res.status(200).json({
        message: toolResult,
        success: true
      });
      return;
    }

    // 9. Return standard text response
    res.status(200).json({
      message: aiResponse.text || 'No pude generar una respuesta.'
    });

  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
