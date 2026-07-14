import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { fuente, limite } = req.body;
  try {
    const results: any[] = [];
    const key = process.env.INSFORGE_API_KEY;
    const fuentes = fuente ? [fuente] : ["insforge.logs","postgREST.logs","postgres.logs","function.logs"];
    for (const src of fuentes) {
      const r = await fetch(`https://6vgumkqu.us-east.insforge.app/api/logs/${src}?limit=${limite ?? 10}`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (r.ok) {
        const json = await r.json();
        results.push({ fuente: src, logs: Array.isArray(json) ? json.slice(0, limite ?? 10) : [] });
      }
    }
    res.json({ contenedores: results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
