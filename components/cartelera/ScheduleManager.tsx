import React, { useState } from 'react';
import { Icon } from '../ui/Icon';

interface ScheduleEntry {
  id: string;
  contenidoId: string;
  displayId: string;
  posicion: number;
  duracionSegundos: number;
  titulo: string;
}

const ScheduleManager: React.FC = () => {
  const [entries] = useState<ScheduleEntry[]>([]);

  const handleRemove = (id: string) => {
    // Placeholder for scheduled removal
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Icon name="clock" className="w-4 h-4 text-blue-600" />
          Programación de displays
        </h3>
      </div>

      {entries.length === 0 ? (
        <div className="p-6 text-center">
          <Icon name="monitor" className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-500 mt-2">No hay contenido programado</p>
          <p className="text-xs text-gray-400 mt-1">
            Publica un cartel en uno o más displays para ver la programación
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {entries.map((entry) => (
            <div key={entry.id} className="p-3 flex items-center gap-3">
              <span className="text-sm font-medium text-gray-400 w-6">{entry.posicion + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{entry.titulo}</p>
                <p className="text-xs text-gray-500">
                  Display: {entry.displayId} &middot; {entry.duracionSegundos}s
                </p>
              </div>
              <button
                onClick={() => handleRemove(entry.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                aria-label="Eliminar"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleManager;
