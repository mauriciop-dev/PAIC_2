import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { to, subject, html } = req.body;
    const key = process.env.RESEND_API_KEY;
    if (!key) return res.status(500).json({ error: "Resend API key not configured" });
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "PAIC 2.0 <notificaciones@paicai.com.co>", to, subject, html }),
    });
    const data = await response.json();
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
