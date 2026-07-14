import { useState, useEffect } from "react";
import { useCopropiedad } from "@/context/CopropiedadContext";
import { adminInsforge } from "@/lib/insforge";

export default function VencimientosPage() {
  const { actual } = useCopropiedad();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!actual) return;
    adminInsforge!.database.from("due_dates").select("*").eq("conjunto_id", actual.id).order("fecha_vencimiento", { ascending: true }).then(({ data }) => setItems(data ?? []));
  }, [actual]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Vencimientos</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vence</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th></tr></thead>
          <tbody className="divide-y divide-gray-200">
            {items.map(d => <tr key={d.id} className="hover:bg-gray-50"><td className="px-4 py-3 text-sm">{d.concepto}</td><td className="px-4 py-3 text-sm">${Number(d.monto).toLocaleString("es-CO")}</td><td className="px-4 py-3 text-sm">{d.fecha_vencimiento}</td><td className="px-4 py-3"><span className={"px-2 py-1 text-xs rounded " + (d.estado === "pagado" ? "bg-green-100 text-green-700" : d.estado === "vencido" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700")}>{d.estado}</span></td></tr>)}
            {items.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No hay vencimientos</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
