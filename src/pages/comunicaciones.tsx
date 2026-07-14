import { useState, useEffect } from "react";
import { useCopropiedad } from "@/context/CopropiedadContext";
import { adminInsforge } from "@/lib/insforge";

export default function ComunicacionesPage() {
  const { actual } = useCopropiedad();
  const [mensajes, setMensajes] = useState<any[]>([]);

  useEffect(() => {
    if (!actual) return;
    adminInsforge!.database.from("comunicaciones")?.select("*")?.eq("conjunto_id", actual.id)?.order("created_at", { ascending: false })?.then(({ data }: any) => setMensajes(data ?? []));
  }, [actual]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Comunicaciones</h1>
      <div className="space-y-3">
        {mensajes.map(m => (
          <div key={m.id} className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center justify-between mb-2"><h3 className="font-semibold">{m.asunto}</h3><span className="text-xs text-gray-400">{m.created_at}</span></div>
            <p className="text-sm text-gray-600">{m.mensaje}</p>
          </div>
        ))}
        {mensajes.length === 0 && <p className="text-gray-400 text-center py-8">No hay comunicaciones</p>}
      </div>
    </div>
  );
}
