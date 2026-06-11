import React, { useState } from 'react';
import { ConjuntoInfo } from '../../types';
import { Icon } from '../ui/Icon';
import { supabase } from '../../services/supabaseClient';

interface PorteriaViewProps {
  conjuntoInfo: ConjuntoInfo | null;
  conjuntoName: string;
}

const PorteriaView: React.FC<PorteriaViewProps> = ({ conjuntoInfo, conjuntoName }) => {
  const [visitanteNombre, setVisitanteNombre] = useState('');
  const [visitanteDocumento, setVisitanteDocumento] = useState('');
  const [apartamento, setApartamento] = useState('');
  const [residenteId, setResidenteId] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const solicitarAutorizacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitanteNombre || !apartamento || !residenteId) return;

    setSending(true);
    setError('');
    setSent(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Sesión no encontrada');
        setSending(false);
        return;
      }

      const response = await fetch('/api/notifications/solicitar-autorizacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          visitanteNombre,
          visitanteDocumento: visitanteDocumento || undefined,
          apartamento,
          residenteId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Error al solicitar autorización');
      } else {
        setSent(true);
        setVisitanteNombre('');
        setVisitanteDocumento('');
        setApartamento('');
        setResidenteId('');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Portería - {conjuntoName}</h1>
          <p className="text-sm text-gray-500">Registro de visitas</p>
        </div>
        <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">● En línea</span>
      </div>

      <form onSubmit={solicitarAutorizacion} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-800">Solicitar autorización de visita</h2>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Nombre del visitante</label>
          <input
            type="text"
            value={visitanteNombre}
            onChange={(e) => setVisitanteNombre(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Juan Pérez"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Documento (opcional)</label>
          <input
            type="text"
            value={visitanteDocumento}
            onChange={(e) => setVisitanteDocumento(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: CC 123456789"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Apartamento</label>
          <input
            type="text"
            value={apartamento}
            onChange={(e) => setApartamento(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: 402"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">ID del residente</label>
          <input
            type="text"
            value={residenteId}
            onChange={(e) => setResidenteId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="UUID del residente"
            required
          />
        </div>

        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}

        {sent && (
          <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            Notificación enviada al residente
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {sending ? 'Enviando...' : 'Solicitar autorización'}
        </button>
      </form>
    </div>
  );
};

export default PorteriaView;
