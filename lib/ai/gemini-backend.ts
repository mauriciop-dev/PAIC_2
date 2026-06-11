import { GoogleGenAI } from '@google/genai';

export interface AIResponse {
  text: string | null;
  toolCalls?: Array<{
    name: string;
    args: any;
  }>;
  usageMetadata?: {
    promptTokens: number;
    completionTokens: number;
  };
  provider: 'gemini' | 'groq' | 'deepseek';
}

function cleanSchemaForOpenAI(schema: any): any {
  if (!schema) return schema;
  if (Array.isArray(schema)) {
    return schema.map(cleanSchemaForOpenAI);
  }
  if (typeof schema === 'object') {
    const cleaned: any = {};
    for (const key in schema) {
      if (key === 'type' && typeof schema[key] === 'string') {
        cleaned[key] = schema[key].toLowerCase();
      } else {
        cleaned[key] = cleanSchemaForOpenAI(schema[key]);
      }
    }
    return cleaned;
  }
  return schema;
}

async function callGemini(
  apiKey: string,
  systemInstruction: string,
  message: string,
  history: any[],
  tools: any
): Promise<AIResponse> {
  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

  const formattedHistory = history.map(item => ({
    role: item.sender === 'user' ? 'user' : 'model',
    parts: [{ text: item.text }]
  }));

  const chat = ai.chats.create({
    model,
    config: {
      systemInstruction,
      tools,
    },
    history: formattedHistory
  });

  const response = await chat.sendMessage({ message });

  return {
    text: response.text || null,
    toolCalls: response.functionCalls?.map(c => ({
      name: c.name,
      args: c.args
    })),
    usageMetadata: {
      promptTokens: (response.usageMetadata as any)?.promptTokenCount || (response.usageMetadata as any)?.promptTokenUsageMetrics?.inputTokenCount || 0,
      completionTokens: (response.usageMetadata as any)?.candidatesTokenCount || (response.usageMetadata as any)?.candidatesTokenUsageMetrics?.outputTokenCount || 0
    },
    provider: 'gemini'
  };
}

async function callOpenAICompatible(
  endpoint: string,
  model: string,
  apiKey: string,
  systemInstruction: string,
  message: string,
  history: any[],
  tools: any,
  provider: 'groq' | 'deepseek'
): Promise<AIResponse> {
  const openAITools = tools[0].functionDeclarations.map((fd: any) => ({
    type: "function",
    function: {
      name: fd.name,
      description: fd.description,
      parameters: cleanSchemaForOpenAI(fd.parameters)
    }
  }));

  const messages = [
    { role: "system", content: systemInstruction },
    ...history.map(h => ({
      role: h.sender === 'user' ? 'user' : 'assistant',
      content: h.text
    })),
    { role: "user", content: message }
  ];

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages,
      tools: openAITools,
      tool_choice: "auto"
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`${provider} API error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  const choice = data.choices[0];
  const choiceMessage = choice.message;

  return {
    text: choiceMessage.content || null,
    toolCalls: choiceMessage.tool_calls?.map((tc: any) => ({
      name: tc.function.name,
      args: JSON.parse(tc.function.arguments)
    })),
    usageMetadata: {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0
    },
    provider: provider
  };
}

export async function callAI(
  systemInstruction: string,
  message: string,
  history: any[],
  tools: any
): Promise<AIResponse> {
  // 1. Try Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey !== 'PLACEHOLDER_API_KEY') {
    try {
      console.log("Attempting Gemini API call...");
      return await callGemini(geminiKey, systemInstruction, message, history, tools);
    } catch (err: any) {
      console.warn("Gemini API call failed, falling back. Error:", err.message || err);
    }
  } else {
    console.warn("GEMINI_API_KEY is not configured or placeholder.");
  }

  // 2. Try Groq Fallback
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      console.log("Attempting Groq API call...");
      return await callOpenAICompatible(
        "https://api.groq.com/openai/v1/chat/completions",
        "llama-3.3-70b-versatile",
        groqKey,
        systemInstruction,
        message,
        history,
        tools,
        'groq'
      );
    } catch (err: any) {
      console.warn("Groq API call failed, falling back. Error:", err.message || err);
    }
  } else {
    console.warn("GROQ_API_KEY is not configured.");
  }

  // 3. Try DeepSeek Fallback
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  if (deepseekKey) {
    try {
      console.log("Attempting DeepSeek API call...");
      return await callOpenAICompatible(
        "https://api.deepseek.com/chat/completions",
        "deepseek-chat",
        deepseekKey,
        systemInstruction,
        message,
        history,
        tools,
        'deepseek'
      );
    } catch (err: any) {
      console.error("DeepSeek API call failed. Error:", err.message || err);
    }
  } else {
    console.warn("DEEPSEEK_API_KEY is not configured.");
  }

  throw new Error("All AI Providers failed or no API keys were configured.");
}
