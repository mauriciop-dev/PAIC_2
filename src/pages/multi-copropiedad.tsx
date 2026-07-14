import { useState, useEffect } from "react";
import { useCopropiedad } from "@/context/CopropiedadContext";
import { adminInsforge } from "@/lib/insforge";

export default function MultiCopropiedadPage() {
  const { actual, lista, setActual } = useCopropiedad();
  const [conjuntos, setConjuntos] = useState<any[]>([]);
  const [stats, setStats] = useState<Record<string, any>>({});

  useEffect(() => {
    adminInsforge!.database.from("conjuntos").select("*").then(({ data }) => setConjuntos(data ?? []));
  }, []);

  useEffect(() => {
    async function loadStats() {
      const s: Record<string, any> = {};
      for (const c of conjuntos) {
        const [r, i, e] = await Promise.all([
          adminInsforge!.database.from("residents").select("*", { count: "exact", head: true }).eq("conjunto_id", c.id),
          adminInsforge!.database.from("incomes").select("*", { count: "exact", head: true }).eq("conjunto_id", c.id),
          adminInsforge!.database.from("expenses").select("*", { count: "exact", head: true }).eq("conjunto_id", c.id),
        ]);
        s[c.id] = { residents: r.count ?? 0, incomes: i.count ?? 0, expenses: e.count ?? 0 };
      }
      setStats(s);
    }
    if (conjuntos.length > 0) loadStats();
  }, [conjuntos]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Multi-Copropiedad</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {conjuntos.map(c => (
          <div key={c.id} className={"bg-white rounded-xl shadow-sm border p-5 cursor-pointer transition hover:shadow-md " + (actual?.id === c.id ? "ring-2 ring-blue-500" : "")} onClick={() => setActual(c)}>
            <h3 className="font-semibold text-lg">{c.nombre}</h3>
            <p className="text-sm text-gray-500">{c.ciudad}</p>
            <div className="mt-3 flex gap-3 text-sm text-gray-600">
              <span>{stats[c.id]?.residents ?? "..."} residentes</span>
              <span>{stats[c.id]?.incomes ?? "..."} ingresos</span>
              <span>{stats[c.id]?.expenses ?? "..."} gastos</span>
            </div>
          </div>
        ))}
        {conjuntos.length === 0 && <p className="text-gray-400 col-span-full text-center py-8">No hay copropiedades registradas</p>}
      </div>
    </div>
  );
}
