import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.json({
    features: {
      ai_chat: true,
      modo_curso: true,
      modo_agente: true,
      streaming: true,
      max_tokens: 4096,
      temperature: 0.7,
    },
  });
}
