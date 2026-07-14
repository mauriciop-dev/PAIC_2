import type { NextApiRequest, NextApiResponse } from "next";
import { chatCompletionStream, chatCompletion } from "@/services/ai/chat";
import { odinStream } from "@/services/ai/odin";

export const config = { runtime: "nodejs" };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { messages, modo, conjunto_id, stream: useStream } = req.body;
  if (!messages?.length) return res.status(400).json({ error: "Messages are required" });

  if (modo === "agente") {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    try {
      const gen = odinStream({ messages, modo: "agente", conjunto_id });
      for await (const event of gen) {
        if (event.type === "text") {
          res.write(`data: ${JSON.stringify({ type: "text", content: event.content })}\n\n`);
        } else if (event.type === "tool") {
          res.write(`data: ${JSON.stringify({ type: "tool", name: event.name, status: event.status })}\n\n`);
        }
      }
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ type: "error", content: err.message })}\n\n`);
      res.end();
    }
    return;
  }

  if (useStream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    try {
      const gen = chatCompletionStream({ messages, modo });
      for await (const text of gen) {
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    } catch (err: any) {
      res.write(`data: ${JSON.stringify({ type: "error", content: err.message })}\n\n`);
      res.end();
    }
  } else {
    try {
      const result = await chatCompletion({ messages, modo });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
