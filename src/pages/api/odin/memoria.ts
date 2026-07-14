import type { NextApiRequest, NextApiResponse } from "next";
import { adminInsforge } from "@/lib/insforge";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { conjunto_id } = req.query;

  if (method === "GET") {
    const { data, error } = await adminInsforge!.database
      .from("odin_memoria")
      .select("*")
      .eq("conjunto_id", conjunto_id ?? "")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ data });
  }

  if (method === "POST") {
    const { tipo, contenido } = req.body;
    const { data, error } = await adminInsforge!.database
      .from("odin_memoria")
      .insert([{ tipo, contenido, conjunto_id: conjunto_id ?? null }])
      .select();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ data });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
