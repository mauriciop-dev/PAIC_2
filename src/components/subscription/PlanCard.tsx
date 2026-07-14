import type { Plan } from "@/services/subscription";

type Props = { plan: Plan; selected: boolean; onSelect: () => void; onSubscribe: () => void; loading?: boolean };

export default function PlanCard({ plan, selected, onSelect, onSubscribe, loading }: Props) {
  return (
    <div className={"bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition " + (selected ? "ring-2 ring-blue-500" : "hover:shadow-md")} onClick={onSelect}>
      <h3 className="text-lg font-bold">{plan.nombre}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-2">${plan.precio.toLocaleString("es-CO")}<span className="text-sm text-gray-500 font-normal">/mes</span></p>
      <p className="text-sm text-gray-500 mt-1">{plan.descripcion}</p>
      <ul className="mt-4 space-y-2">
        {plan.modulos.map((m) => <li key={m} className="text-sm text-gray-600 flex items-center gap-2"><span className="text-green-500">✓</span> {m.replace(/_/g, " ")}</li>)}
      </ul>
      {selected && (
        <button onClick={(e) => { e.stopPropagation(); onSubscribe(); }} disabled={loading} className="w-full mt-4 bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Procesando..." : plan.precio === 0 ? "Seleccionar" : "Suscribirse"}
        </button>
      )}
    </div>
  );
}
