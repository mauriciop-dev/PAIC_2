import React, { useState, useEffect } from 'react';
import { Icon } from '../ui/Icon';

interface Alert {
  id: string;
  tipo: string;
  severidad: string;
  mensaje: string;
  created_at: string;
  resuelta: boolean;
  agent_registry?: { nombre: string; tipo: string };
}

const SEVERIDAD_STYLES: Record<string, string> = {
  critica: 'bg-red-50 border-red-300 text-red-800',
  alta: 'bg-orange-50 border-orange-300 text-orange-800',
  media: 'bg-yellow-50 border-yellow-300 text-yellow-800',
  baja: 'bg-blue-50 border-blue-300 text-blue-800',
};

const AlertCenter: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active'>('active');

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchAlerts = async () => {
    try {
      const params = filter === 'active' ? '?resuelta=false' : '';
      const response = await fetch(`/api/gran-hermano/alerts${params}`);
      if (response.ok) {
        setAlerts(await response.json());
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/gran-hermano/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });
      if (response.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      }
    } catch {
      console.error('Failed to resolve alert');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Icon name="alert-triangle" className="w-4 h-4" />
          Centro de alertas
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setFilter('active')}
            className={`px-2 py-1 text-xs rounded-md ${filter === 'active' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Activas
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-1 text-xs rounded-md ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Todas
          </button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="p-6 text-center">
          <Icon name="shield-check" className="w-8 h-8 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-500 mt-2">
            {filter === 'active' ? 'No hay alertas activas' : 'No hay alertas registradas'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {alerts.map((alert) => (
            <div key={alert.id} className={`p-3 border-l-2 ${SEVERIDAD_STYLES[alert.severidad]?.split(' ')[1] || 'border-gray-200'}`}>
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${SEVERIDAD_STYLES[alert.severidad] || 'bg-gray-100 text-gray-600'}`}>
                      {alert.severidad}
                    </span>
                    <span className="text-xs text-gray-400">{alert.tipo}</span>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{alert.mensaje}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {alert.agent_registry && (
                      <span className="text-xs text-gray-400">{alert.agent_registry.nombre}</span>
                    )}
                    <span className="text-xs text-gray-400">{new Date(alert.created_at).toLocaleString()}</span>
                  </div>
                </div>
                {!alert.resuelta && (
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                    aria-label="Resolver alerta"
                  >
                    <Icon name="x" className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertCenter;
