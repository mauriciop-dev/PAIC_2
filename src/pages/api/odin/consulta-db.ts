import type { NextApiRequest, NextApiResponse } from "next";
import { adminInsforge } from "@/lib/insforge";

const FK_MAP: Record<string, string> = {
  residents: "conjunto_id", unidades: "copropiedad_id", tasks: "conjunto_id",
  providers: "conjunto_id", internal_staff: "conjunto_id", visitor_logs: "conjunto_id",
  package_logs: "conjunto_id", incomes: "conjunto_id", expenses: "conjunto_id",
  due_dates: "conjunto_id", common_areas: "conjunto_id", reservations: "conjunto_id",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { tabla, filtros, limite, conjunto_id } = req.body;
  let q = adminInsforge!.database.from(tabla).select("*");
  if (FK_MAP[tabla] && conjunto_id) q = q.eq(FK_MAP[tabla], conjunto_id);
  if (filtros) { for (const [col, val] of Object.entries(filtros)) q = q.eq(col, val); }
  const { data, error } = await q.limit(limite ?? 10);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ data });
}
