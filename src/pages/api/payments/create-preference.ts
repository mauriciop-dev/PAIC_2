import type { NextApiRequest, NextApiResponse } from "next";

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { planId, conjuntoId } = req.body;
  const plan = planId === "full" ? { id: "full", precio: 99000, nombre: "Plan Full" }
    : planId === "total" ? { id: "total", precio: 149000, nombre: "Plan Total" }
    : { id: "multi", precio: 249000, nombre: "Plan Multi-Copropiedad" };
  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ title: plan.nombre, quantity: 1, unit_price: plan.precio, currency_id: "COP" }],
        back_urls: { success: `${req.headers.origin}/dashboard`, failure: `${req.headers.origin}/settings`, pending: `${req.headers.origin}/dashboard` },
        auto_return: "approved",
        metadata: { plan_id: plan.id, conjunto_id: conjuntoId },
      }),
    });
    const data = await response.json();
    res.json({ init_point: data.init_point, preference_id: data.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
