import { useCopropiedad } from "@/context/CopropiedadContext";

export default function SettingsPage() {
  const { actual } = useCopropiedad();
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6 max-w-2xl">
        <h2 className="text-lg font-semibold mb-4">Copropiedad Activa</h2>
        {actual ? (
          <dl className="space-y-3">
            <div className="flex justify-between"><dt className="text-gray-500">Nombre</dt><dd className="font-medium">{actual.nombre}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Dirección</dt><dd>{actual.direccion ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Plan</dt><dd><span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">{actual.subscription_plan ?? "basico"}</span></dd></div>
          </dl>
        ) : <p className="text-gray-400">No hay copropiedad seleccionada</p>}
      </div>
    </div>
  );
}
