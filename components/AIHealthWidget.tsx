import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from './ui/Icon';

interface AIHealthData {
  status: string;
  timestamp: string;
  services: {
    database: { status: string; latencyMs?: number; error?: string };
    ai: {
      status: string;
      gemini_configured: boolean;
      groq_configured: boolean;
      deepseek_configured: boolean;
      active_keys_count: number;
      error?: string;
    };
  };
}

const AIHealthWidget: React.FC = () => {
  const [health, setHealth] = useState<AIHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }

  if (!health) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
        <div className="flex items-center gap-2">
          <Icon name="alert-triangle" className="w-5 h-5 text-red-500" />
          <span className="text-sm font-semibold text-red-700">Error al conectar con el health check</span>
        </div>
      </div>
    );
  }

  const dbOk = health.services.database.status === 'up';
  const aiOk = health.services.ai.status === 'up';
  const overallOk = health.status === 'healthy';

  return (
    <div className="bg-white rounded-lg shadow-md border-l-4 border-l-transparent overflow-hidden"
      style={{ borderLeftColor: overallOk ? '#22c55e' : '#ef4444' }}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${overallOk ? 'bg-green-100' : 'bg-red-100'}`}>
            <Icon name="bot" className={`w-5 h-5 ${overallOk ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">Estado del Asistente IA</p>
            <p className={`text-xs font-medium ${overallOk ? 'text-green-600' : 'text-red-600'}`}>
              {overallOk ? '● Saludable' : '● Degradado'}
            </p>
          </div>
        </div>
        <Icon name="refresh-cw" className="w-4 h-4 text-gray-400" />
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Base de datos</span>
            <span className={`font-medium ${dbOk ? 'text-green-600' : 'text-red-600'}`}>
              {dbOk ? `Conectada (${health.services.database.latencyMs}ms)` : 'Caída'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Proveedores IA activos</span>
            <span className="font-medium text-gray-700">{health.services.ai.active_keys_count}</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1">
            {health.services.ai.gemini_configured && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Gemini</span>
            )}
            {health.services.ai.groq_configured && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">Groq</span>
            )}
            {health.services.ai.deepseek_configured && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">DeepSeek</span>
            )}
          </div>
          {health.services.ai.error && (
            <p className="text-xs text-red-500 mt-1">{health.services.ai.error}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AIHealthWidget;
