import { useState, useEffect } from "react";
import { adminInsforge } from "@/lib/insforge";
import { useCopropiedad } from "@/context/CopropiedadContext";

export default function CarteleraPage() {
  const { actual } = useCopropiedad();
  const [contenidos, setContenidos] = useState<any[]>([]);

  useEffect(() => {
    if (!actual) return;
    adminInsforge!.database.from("carteleria_contenidos").select("*").eq("conjunto_id", actual.id).order("created_at", { ascending: false }).then(({ data }) => setContenidos(data ?? []));
  }, [actual]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cartelera Digital</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contenidos.map(c => (
          <div key={c.id} className="bg-white rounded-xl shadow-sm border p-4">
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">{c.tipo}</span>
            <h3 className="font-semibold mt-2">{c.titulo}</h3>
            <p className="text-sm text-gray-600 mt-1">{c.contenido}</p>
          </div>
        ))}
        {contenidos.length === 0 && <p className="text-gray-400 col-span-full text-center py-8">No hay contenidos publicados</p>}
      </div>
    </div>
  );
}
