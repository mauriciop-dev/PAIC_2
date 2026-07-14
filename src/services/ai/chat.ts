import OpenAI from "openai";
import { searchRagDocs, SYSTEM_PROMPT } from "@/data/rag-docs";
import { buscarEnCursos, obtenerCursoCompleto, cursos } from "@/data/cursos";

export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    "HTTP-Referer": "https://paic2.app",
    "X-Title": "PAIC 2.0",
  },
});

const MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatRequest = {
  messages: Message[];
  modo?: "chat" | "curso";
};

function buildSystemMessage(modo?: string, userQuery?: string): string {
  let context = searchRagDocs(userQuery ?? "");
  if (modo === "curso") {
    const cursoContext = buscarEnCursos(userQuery ?? "");
    context = `--- DOCUMENTACIÓN DE LA PLATAFORMA ---\n${context}\n\n--- CURSO DE COPROPIEDAD ---\n${cursoContext}`;
  }
  return `${SYSTEM_PROMPT}\n\nContexto de la plataforma:\n${context}`;
}

export async function chatCompletion(request: ChatRequest) {
  const { messages, modo } = request;
  const userQuery = messages.find((m) => m.role === "user")?.content ?? "";
  const systemContent = buildSystemMessage(modo, userQuery);
  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemContent },
      ...messages.filter((m) => m.role !== "system"),
    ],
  });
  return { text: completion.choices[0]?.message?.content ?? "No se pudo generar una respuesta." };
}

export async function* chatCompletionStream(request: ChatRequest): AsyncGenerator<string> {
  const { messages, modo } = request;
  const userQuery = messages.find((m) => m.role === "user")?.content ?? "";
  const systemContent = buildSystemMessage(modo, userQuery);
  const stream = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: systemContent },
      ...messages.filter((m) => m.role !== "system"),
    ],
    stream: true,
  });
  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) yield text;
  }
}
