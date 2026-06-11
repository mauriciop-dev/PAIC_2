import React, { useState, useEffect } from 'react';
import { Icon } from '../ui/Icon';

interface LprEvent {
  id: string;
  placa: string;
  confianza: number;
  accion: string;
  timestamp: string;
  imagen_url: string | null;
}

const LPRDetector: React.FC = () => {
  const [events, setEvents] = useState<LprEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/camaras?action=lpr-list');
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Icon name="shield-check" className="w-4 h-4 text-blue-600" />
          Lectura de Placas (LPR)
        </h3>
      </div>

      {events.length === 0 ? (
        <div className="p-6 text-center">
          <Icon name="camera" className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-500 mt-2">No hay eventos de lectura de placas</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
          {events.map((event) => (
            <div key={event.id} className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-gray-700">{event.placa.slice(0, 3)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{event.placa}</p>
                <p className="text-xs text-gray-500">
                  {new Date(event.timestamp).toLocaleString()}
                </p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                event.accion === 'permitido' ? 'bg-green-50 text-green-700' :
                event.accion === 'bloqueado' ? 'bg-red-50 text-red-700' :
                'bg-yellow-50 text-yellow-700'
              }`}>
                {event.accion}
              </span>
              {event.confianza && (
                <span className="text-xs text-gray-400">
                  {Math.round(event.confianza * 100)}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LPRDetector;
