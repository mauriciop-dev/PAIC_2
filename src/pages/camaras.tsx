import { useState, useEffect } from "react";
import { adminInsforge } from "@/lib/insforge";
import { useCopropiedad } from "@/context/CopropiedadContext";

export default function CamarasPage() {
  const { actual } = useCopropiedad();
  const [camaras, setCamaras] = useState<any[]>([]);

  useEffect(() => {
    if (!actual) return;
    adminInsforge!.database.from("camaras").select("*").eq("conjunto_id", actual.id).then(({ data }) => setCamaras(data ?? []));
  }, [actual]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Cámaras</h1>
      {camaras.length === 0 ? <p className="text-gray-500">No hay cámaras configuradas</p> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {camaras.map(c => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="font-semibold">{c.nombre}</h3>
              <p className="text-sm text-gray-500">{c.ubicacion}</p>
              {c.url_stream && <img src={c.url_stream} alt={c.nombre} className="mt-2 rounded-lg w-full h-40 object-cover bg-gray-100" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
