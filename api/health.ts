import type { VercelRequest, VercelResponse } from '@vercel/node';
import { insforgeAdmin } from '../lib/insforgeAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const status: Record<string, any> = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {}
  };

  let isDegraded = false;

  try {
    const start = Date.now();
    const { error } = await insforgeAdmin.database.from('conjuntos').select('id').limit(1);

    if (error) throw error;

    status.services.database = {
      status: 'up',
      latencyMs: Date.now() - start
    };
  } catch (err: any) {
    isDegraded = true;
    status.services.database = {
      status: 'down',
      error: err.message || err
    };
  }

  const hasGemini = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'PLACEHOLDER_API_KEY';
  const hasGroq = !!process.env.GROQ_API_KEY;
  const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;

  status.services.ai = {
    gemini_configured: hasGemini,
    groq_configured: hasGroq,
    deepseek_configured: hasDeepSeek,
    active_keys_count: [hasGemini, hasGroq, hasDeepSeek].filter(Boolean).length
  };

  if (status.services.ai.active_keys_count === 0) {
    isDegraded = true;
    status.services.ai.status = 'error';
    status.services.ai.error = 'No AI provider keys configured.';
  } else {
    status.services.ai.status = 'up';
  }

  if (isDegraded) {
    status.status = 'degraded';
    res.status(500).json(status);
  } else {
    res.status(200).json(status);
  }
}
