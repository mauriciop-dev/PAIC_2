import React, { useState, useEffect } from 'react';
import { Icon } from '../ui/Icon';

interface Agent {
  id: string;
  nombre: string;
  tipo: string;
  estado: string;
  ultimo_heartbeat: string | null;
  version: string | null;
}

const AGENT_ICONS: Record<string, string> = {
  sre: 'refresh-cw',
  shadow_qa: 'checkSquare',
  shadow_security: 'shield',
  user_habits: 'trending-up',
};

const AGENT_COLORS: Record<string, string> = {
  online: 'text-green-500 bg-green-50 border-green-200',
  offline: 'text-gray-400 bg-gray-50 border-gray-200',
  error: 'text-red-500 bg-red-50 border-red-200',
  degrading: 'text-yellow-500 bg-yellow-50 border-yellow-200',
};

const AgentStatus: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents/status');
      if (response.ok) {
        const data = await response.json();
        setAgents(data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
        <Icon name="bot" className="w-10 h-10 text-gray-300 mx-auto" />
        <p className="text-sm text-gray-500 mt-2">No hay agentes registrados</p>
        <p className="text-xs text-gray-400 mt-1">Los agentes aparecerán cuando se conecten al orquestador</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {agents.map((agent) => {
        const statusColor = AGENT_COLORS[agent.estado] || AGENT_COLORS.offline;
        return (
          <div
            key={agent.id}
            className={`bg-white rounded-xl shadow-sm border p-4 ${statusColor.split(' ')[2] || 'border-gray-200'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusColor.split(' ')[1] || 'bg-gray-50'}`}>
                <Icon name={AGENT_ICONS[agent.tipo] || 'bot'} className={`w-5 h-5 ${statusColor.split(' ')[0] || 'text-gray-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-800">{agent.nombre}</p>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${statusColor}`}>
                    {agent.estado}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 capitalize">{agent.tipo.replace('_', ' ')}</p>
                {agent.ultimo_heartbeat && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Último heartbeat: {new Date(agent.ultimo_heartbeat).toLocaleString()}
                  </p>
                )}
              </div>
              {agent.version && (
                <span className="text-xs text-gray-400">v{agent.version}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AgentStatus;
