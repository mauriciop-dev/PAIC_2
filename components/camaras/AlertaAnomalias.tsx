import React, { useState } from 'react';
import { Icon } from '../ui/Icon';

interface Anomalia {
  id: string;
  tipo: string;
  descripcion: string;
  severidad: 'baja' | 'media' | 'alta' | 'critica';
  timestamp: string;
}

const MOCK_ANOMALIAS: Anomalia[] = [
  { id: '1', tipo: 'Movimiento sospechoso', descripcion: 'Persona merodeando en parqueadero', severidad: 'alta', timestamp: new Date().toISOString() },
  { id: '2', tipo: 'Cámara desconectada', descripcion: 'Cámara entrada peatonal sin señal', severidad: 'critica', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', tipo: 'Vehículo no autorizado', descripcion: 'Placa ABC-123 no registrada intentó ingresar', severidad: 'media', timestamp: new Date(Date.now() - 7200000).toISOString() },
];

const AlertaAnomalias: React.FC = () => {
  const [anomalias] = useState<Anomalia[]>(MOCK_ANOMALIAS);

  const severidadColor = (s: string) => {
    switch (s) {
      case 'critica': return 'bg-red-50 border-red-200 text-red-700';
      case 'alta': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'media': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const severidadBadge = (s: string) => {
    switch (s) {
      case 'critica': return 'bg-red-500';
      case 'alta': return 'bg-orange-500';
      case 'media': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Icon name="alert-triangle" className="w-4 h-4 text-red-500" />
          Alertas de anomalías
        </h3>
        <span className="text-xs font-medium bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
          {anomalias.length} activas
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {anomalias.map((a) => (
          <div key={a.id} className={`p-3 border-l-2 ${severidadColor(a.severidad)}`}>
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${severidadBadge(a.severidad)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{a.tipo}</p>
                <p className="text-xs text-gray-500 mt-0.5">{a.descripcion}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(a.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertaAnomalias;
