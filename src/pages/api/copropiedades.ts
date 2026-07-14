import type { NextApiRequest, NextApiResponse } from "next";
import { adminInsforge } from "@/lib/insforge";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const { data, error } = await adminInsforge!.database.from("conjuntos").select("*").order("nombre");
    if (error) throw error;
    return res.json({ data: data ?? [] });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
