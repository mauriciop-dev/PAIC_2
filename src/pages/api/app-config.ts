import type { NextApiRequest, NextApiResponse } from "next";
import { getFeatureFlags } from "@/services/feature-flags";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  res.json({ features: getFeatureFlags() });
}
