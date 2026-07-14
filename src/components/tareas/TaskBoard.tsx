type Props = { tasks: any[] };

export default function TaskBoard({ tasks }: Props) {
  const columns = ["pendiente", "en_progreso", "completada"];
  const tasksByStatus: Record<string, any[]> = { pendiente: [], en_progreso: [], completada: [] };
  tasks.forEach((t) => { if (tasksByStatus[t.estado]) tasksByStatus[t.estado].push(t); });

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {columns.map((col) => (
        <div key={col} className="bg-gray-50 rounded-xl p-4">
          <h3 className="font-semibold text-sm text-gray-500 uppercase mb-3">
            {col === "pendiente" ? "Pendientes" : col === "en_progreso" ? "En Progreso" : "Completadas"}
            <span className="ml-2 text-xs">({tasksByStatus[col].length})</span>
          </h3>
          <div className="space-y-2">
            {tasksByStatus[col].map((t) => (
              <div key={t.id} className="bg-white rounded-lg shadow-sm border p-3">
                <p className="font-medium text-sm">{t.titulo}</p>
                {t.descripcion && <p className="text-xs text-gray-500 mt-1">{t.descripcion}</p>}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">{t.asignado_a ?? "—"}</span>
                  <span className={"text-xs px-2 py-0.5 rounded " + (t.prioridad === "alta" ? "bg-red-100 text-red-600" : t.prioridad === "media" ? "bg-yellow-100 text-yellow-600" : "bg-green-100 text-green-600")}>{t.prioridad}</span>
                </div>
              </div>
            ))}
            {tasksByStatus[col].length === 0 && <p className="text-xs text-gray-400 text-center py-4">Sin tareas</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
