import React, { useState, useEffect } from 'react';
import { VisitorLog, PackageLog, ConjuntoInfo } from '../../types';
import { Icon } from '../ui/Icon';

interface PorteriaViewProps {
  conjuntoInfo: ConjuntoInfo | null;
  conjuntoName: string;
}

const PorteriaView: React.FC<PorteriaViewProps> = ({ conjuntoInfo, conjuntoName }) => {
  const [activeSection, setActiveSection] = useState<'visitors' | 'packages'>('visitors');
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [packages, setPackages] = useState<PackageLog[]>([]);

  useEffect(() => {
    if (!conjuntoInfo?.id) return;

    fetch(`/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'lista de visitantes', mode: 'chat' }),
    }).catch(() => {});
  }, [conjuntoInfo?.id]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Portería - {conjuntoName}</h1>
        <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded-full">● En línea</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveSection('visitors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'visitors' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Icon name="users" className="w-4 h-4" />
          Visitantes
        </button>
        <button
          onClick={() => setActiveSection('packages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === 'packages' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Icon name="package" className="w-4 h-4" />
          Paquetes
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        {visitors.length === 0 && packages.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="shield" className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-gray-500 mt-3">Usa el botón de Asistente PAIC para gestionar visitas y paquetes</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PorteriaView;
