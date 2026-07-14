import { useState, useEffect } from "react";
import { useCopropiedad } from "@/context/CopropiedadContext";
import { adminInsforge } from "@/lib/insforge";

export default function AreasComunesPage() {
  const { actual } = useCopropiedad();
  const [areas, setAreas] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actual) return;
    Promise.all([
      adminInsforge!.database.from("common_areas").select("*").eq("conjunto_id", actual.id),
      adminInsforge!.database.from("reservations").select("*").eq("conjunto_id", actual.id).order("fecha", { ascending: true }),
    ]).then(([a, r]) => { setAreas(a.data ?? []); setReservations(r.data ?? []); setLoading(false); });
  }, [actual]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Áreas Comunes</h1>
      {loading ? <p className="text-gray-500">Cargando...</p> : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Áreas Disponibles</h2>
            {areas.map(a => <div key={a.id} className="flex justify-between items-center py-2 border-b last:border-0"><span>{a.nombre}</span><span className="text-sm text-gray-500">{a.capacidad} pers.</span></div>)}
            {areas.length === 0 && <p className="text-gray-400 text-center py-4">No hay áreas configuradas</p>}
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Reservaciones</h2>
            {reservations.map(r => <div key={r.id} className="flex justify-between items-center py-2 border-b last:border-0"><div><p className="font-medium">{r.residente_nombre}</p><p className="text-sm text-gray-500">{r.fecha} | {r.hora_inicio}-{r.hora_fin}</p></div></div>)}
            {reservations.length === 0 && <p className="text-gray-400 text-center py-4">No hay reservaciones</p>}
          </div>
        </div>
      )}
    </div>
  );
}
