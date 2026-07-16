import { useState, useEffect } from "react";
import { useCopropiedad } from "@/context/CopropiedadContext";
import { adminInsforge } from "@/lib/insforge";
import dynamic from "next/dynamic";

const DashboardGrid = dynamic(() => import("@/components/dashboard/DashboardGrid"), { ssr: false });

export default function DashboardPage() {
  const { actual } = useCopropiedad();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const copropiedad = actual;
      if (!copropiedad) { setLoading(false); return; }
      try {
        const [residents, incomes, expenses, tasks] = await Promise.all([
          adminInsforge!.database.from("residents").select("*", { count: "exact", head: true }).eq("conjunto_id", copropiedad.id),
          adminInsforge!.database.from("incomes").select("*", { count: "exact", head: true }).eq("conjunto_id", copropiedad.id),
          adminInsforge!.database.from("expenses").select("*", { count: "exact", head: true }).eq("conjunto_id", copropiedad.id),
          adminInsforge!.database.from("tasks").select("*", { count: "exact", head: true }).eq("conjunto_id", copropiedad.id),
        ]);
        setStats({
          residents: residents.count ?? 0,
          incomes: incomes.count ?? 0,
          expenses: expenses.count ?? 0,
          tasks: tasks.count ?? 0,
        });
      } catch {}
      setLoading(false);
    }
    loadStats();
  }, [actual]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{actual?.name ?? "Dashboard"}</h1>
      {actual && <DashboardGrid stats={stats} loading={loading} />}
    </div>
  );
}