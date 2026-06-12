import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { Icon } from '../ui/Icon';
import AgentStatus from '../agents/AgentStatus';
import AlertCenter from '../agents/AlertCenter';
import { insforge } from '../../services/insforgeClient';

interface GranHermanoViewProps {
  userProfile: UserProfile;
}

interface MetricsSummary {
  totalAgents: number;
  onlineAgents: number;
  activeAlerts: number;
  criticalAlerts: number;
}

const GranHermanoView: React.FC<GranHermanoViewProps> = ({ userProfile }) => {
  const [metrics, setMetrics] = useState<MetricsSummary | null>(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState('');

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/gran-hermano?action=metrics');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.stats);
      }
    } catch {
      // Silently fail
    }
  };

  const triggerDiagnostic = async () => {
    setDiagnosticLoading(true);
    setDiagnosticResult('');

    try {
      const headers = insforge.getHttpClient().getHeaders();
      const token = headers['Authorization']?.replace('Bearer ', '');
      if (!token) return;

      const response = await fetch('/api/agents?action=trigger-diagnostic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ agentType: 'full_system' }),
      });

      if (response.ok) {
        setDiagnosticResult('Diagnóstico iniciado. Los resultados aparecerán en breve.');
      } else {
        setDiagnosticResult('Error al iniciar diagnóstico.');
      }
    } catch {
      setDiagnosticResult('Error de conexión.');
    } finally {
      setDiagnosticLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Icon name="shield" className="w-8 h-8 text-blue-400" />
          <div>
            <h2 className="text-xl font-bold">Gran Hermano</h2>
            <p className="text-sm text-gray-400">Panel de monitoreo y orquestación de agentes</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-2xl font-bold">{metrics?.totalAgents || 0}</p>
            <p className="text-xs text-gray-400">Agentes totales</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-2xl font-bold text-green-400">{metrics?.onlineAgents || 0}</p>
            <p className="text-xs text-gray-400">En línea</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-2xl font-bold text-yellow-400">{metrics?.activeAlerts || 0}</p>
            <p className="text-xs text-gray-400">Alertas activas</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-2xl font-bold text-red-400">{metrics?.criticalAlerts || 0}</p>
            <p className="text-xs text-gray-400">Críticas</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={triggerDiagnostic}
          disabled={diagnosticLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Icon name="refresh-cw" className={`w-4 h-4 ${diagnosticLoading ? 'animate-spin' : ''}`} />
          {diagnosticLoading ? 'Ejecutando...' : 'Ejecutar diagnóstico completo'}
        </button>
      </div>

      {diagnosticResult && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
          {diagnosticResult}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AgentStatus />
        <AlertCenter />
      </div>
    </div>
  );
};

export default GranHermanoView;
