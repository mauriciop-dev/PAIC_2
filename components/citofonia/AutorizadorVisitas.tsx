import React, { useState, useEffect } from 'react';
import { Icon } from '../ui/Icon';

interface VisitaPendiente {
  id: string;
  visitanteNombre: string;
  visitanteDocumento: string;
  apartamento: string;
  motivo: string;
  creadaAt: string;
}

interface AutorizadorVisitasProps {
  userId: string;
  conjuntoId: string;
}

const AutorizadorVisitas: React.FC<AutorizadorVisitasProps> = ({ userId, conjuntoId }) => {
  const [pendientes, setPendientes] = useState<VisitaPendiente[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondiendo, setRespondiendo] = useState<string | null>(null);

  useEffect(() => {
    fetchPendientes();
  }, []);

  const fetchPendientes = async () => {
    try {
      const response = await fetch(`/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'lista de autorizaciones pendientes',
          mode: 'query',
        }),
      });
      if (!response.ok) return;
    } catch {
      // Silently fail, component works with empty state
    } finally {
      setLoading(false);
    }
  };

  const handleResponder = async (id: string, autorizado: boolean) => {
    setRespondiendo(id);
    try {
      await fetch(`/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: autorizado
            ? `autorizar visita ${id}`
            : `rechazar visita ${id}`,
          mode: 'chat',
        }),
      });
      setPendientes((prev) => prev.filter((v) => v.id !== id));
    } catch {
      console.error('Failed to respond to authorization');
    } finally {
      setRespondiendo(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (pendientes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <Icon name="shield" className="w-10 h-10 text-gray-300 mx-auto" />
        <p className="text-sm text-gray-500 mt-2">No hay solicitudes de visita pendientes</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-800">Autorizaciones pendientes</h3>
      {pendientes.map((visita) => (
        <div
          key={visita.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <Icon name="users" className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{visita.visitanteNombre}</p>
              <p className="text-xs text-gray-500">
                Apartamento {visita.apartamento}
                {visita.motivo ? ` — ${visita.motivo}` : ''}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => handleResponder(visita.id, false)}
              disabled={respondiendo === visita.id}
              className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
            >
              Rechazar
            </button>
            <button
              onClick={() => handleResponder(visita.id, true)}
              disabled={respondiendo === visita.id}
              className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Autorizar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AutorizadorVisitas;
