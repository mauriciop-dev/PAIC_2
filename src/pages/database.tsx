import { useState, useEffect } from "react";
import { useCopropiedad } from "@/context/CopropiedadContext";
import { adminInsforge } from "@/lib/insforge";

const TABLAS = ["residents","unidades","providers","internal_staff"];

export default function DatabasePage() {
  const { actual } = useCopropiedad();
  const [tabla, setTabla] = useState(TABLAS[0]);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editRow, setEditRow] = useState<any>(null);

  useEffect(() => {
    if (!actual) return;
    setLoading(true);
    adminInsforge!.database.from(tabla).select("*").eq("conjunto_id", actual.id).then(({ data: d }) => { setData(d ?? []); setLoading(false); });
  }, [tabla, actual]);

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Base de Datos</h1>
        <select value={tabla} onChange={e => setTabla(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg bg-white">
          {TABLAS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      {loading ? <p className="text-gray-500">Cargando...</p> : (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>{columns.map(col => <th key={col} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{col}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-200">
              {data.map((row, i) => <tr key={row.id ?? i} className="hover:bg-gray-50 cursor-pointer" onClick={() => setEditRow(row)}>{columns.map(col => <td key={col} className="px-4 py-3 text-sm text-gray-700">{String(row[col] ?? "")}</td>)}</tr>)}
              {data.length === 0 && <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">No hay registros</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
