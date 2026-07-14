import { useState } from "react";

type Props = { visitors: any[]; packages: any[] };

export default function SecurityPanel({ visitors, packages }: Props) {
  const [tab, setTab] = useState<"visitors" | "packages">("visitors");
  return (
    <div>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("visitors")} className={"px-4 py-2 rounded-lg text-sm font-medium " + (tab === "visitors" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600")}>Visitantes</button>
        <button onClick={() => setTab("packages")} className={"px-4 py-2 rounded-lg text-sm font-medium " + (tab === "packages" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600")}>Paquetes</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border">
        {tab === "visitors" ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingreso</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {visitors.map(v => <tr key={v.id} className="hover:bg-gray-50"><td className="px-4 py-3 text-sm">{v.nombre}</td><td className="px-4 py-3 text-sm">{v.unidad}</td><td className="px-4 py-3 text-sm">{new Date(v.created_at).toLocaleString("es-CO")}</td><td className="px-4 py-3"><span className={"px-2 py-1 text-xs rounded " + (v.estado === "activo" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>{v.estado}</span></td></tr>)}
              {visitors.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Sin registros</td></tr>}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recibido</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {packages.map(p => <tr key={p.id} className="hover:bg-gray-50"><td className="px-4 py-3 text-sm">{p.descripcion}</td><td className="px-4 py-3 text-sm">{p.unidad}</td><td className="px-4 py-3 text-sm">{new Date(p.created_at).toLocaleString("es-CO")}</td><td className="px-4 py-3"><span className={"px-2 py-1 text-xs rounded " + (p.estado === "recibido" ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700")}>{p.estado}</span></td></tr>)}
              {packages.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Sin registros</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
