import type { NextApiRequest, NextApiResponse } from "next";
import { adminInsforge } from "@/lib/insforge";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const payment = req.body;
    if (payment.type === "payment") {
      const paymentId = payment.data?.id;
      if (paymentId) {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
        });
        const paymentData = await response.json();
        if (paymentData.status === "approved") {
          const { plan_id, conjunto_id } = paymentData.metadata ?? {};
          if (plan_id && conjunto_id) {
            await adminInsforge!.database.from("suscripciones").insert([{
              copropiedad_id: conjunto_id,
              plan_id,
              estado: "activa",
              mp_payment_id: paymentId,
              fecha_inicio: new Date().toISOString(),
              fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            }]);
          }
        }
      }
    }
    res.json({ received: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
