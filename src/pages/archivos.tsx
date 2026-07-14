import { useState, useEffect } from "react";
import { useCopropiedad } from "@/context/CopropiedadContext";
import { adminInsforge } from "@/lib/insforge";

export default function ArchivosPage() {
  const { actual } = useCopropiedad();
  const [archivos, setArchivos] = useState<any[]>([]);

  useEffect(() => {
    if (!actual) return;
    adminInsforge!.database.from("archivos")?.select("*")?.eq("conjunto_id", actual.id)?.order("created_at", { ascending: false })?.then(({ data }: any) => setArchivos(data ?? []));
  }, [actual]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Archivos</h1>
      <div className="grid gap-3">
        {archivos.map(a => (
          <div key={a.id} className="bg-white rounded-xl shadow-sm border p-4 flex items-center justify-between">
            <div><p className="font-medium">{a.nombre}</p><p className="text-sm text-gray-500">{a.categoria}</p></div>
            <span className="text-xs text-gray-400">{a.created_at}</span>
          </div>
        ))}
        {archivos.length === 0 && <p className="text-gray-400 text-center py-8">No hay archivos</p>}
      </div>
    </div>
  );
}
