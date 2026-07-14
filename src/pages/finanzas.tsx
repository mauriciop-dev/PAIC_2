import { useState, useEffect } from "react";
import { useCopropiedad } from "@/context/CopropiedadContext";
import { adminInsforge } from "@/lib/insforge";
import dynamic from "next/dynamic";

const FinancialDashboard = dynamic(() => import("@/components/finanzas/FinancialDashboard"), { ssr: false });

export default function FinanzasPage() {
  const { actual } = useCopropiedad();
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    if (!actual) return;
    Promise.all([
      adminInsforge!.database.from("incomes").select("*").eq("conjunto_id", actual.id),
      adminInsforge!.database.from("expenses").select("*").eq("conjunto_id", actual.id),
    ]).then(([i, e]) => setData({ incomes: i.data ?? [], expenses: e.data ?? [] }));
  }, [actual]);
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Finanzas</h1>
      {data && <FinancialDashboard data={data} />}
    </div>
  );
}
