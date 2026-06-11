import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

interface AgentRecord {
  agentId: string;
  name: string;
  type: string;
  status: string;
  lastHeartbeat: Date;
  metricsUrl?: string;
}

const agents = new Map<string, AgentRecord>();

app.post('/api/agents/health', (req, res) => {
  const { agent_id, status, ...rest } = req.body;
  if (!agent_id) return res.status(400).json({ error: 'agent_id required' });

  const existing = agents.get(agent_id);
  if (existing) {
    existing.status = status || existing.status;
    existing.lastHeartbeat = new Date();
  } else {
    agents.set(agent_id, {
      agentId: agent_id,
      name: rest.name || agent_id,
      type: rest.type || 'unknown',
      status: status || 'online',
      lastHeartbeat: new Date(),
      metricsUrl: rest.metricsUrl,
    });
  }

  res.json({ success: true, agentsCount: agents.size });
});

app.post('/api/agents/alert', (req, res) => {
  const { agent_id, type, severity, message } = req.body;
  console.log(`[ALERT] [${severity}] ${type}: ${message} (agent: ${agent_id})`);
  res.json({ success: true });
});

app.get('/api/agents/registry', (_req, res) => {
  const agentList = Array.from(agents.values()).map((a) => ({
    ...a,
    lastHeartbeat: a.lastHeartbeat.toISOString(),
  }));
  res.json(agentList);
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    agentsOnline: Array.from(agents.values()).filter((a) => a.status === 'online' || a.status === 'ok').length,
    totalAgents: agents.size,
    timestamp: new Date().toISOString(),
  });
});

const PORT = parseInt(process.env.PORT || '3001', 10);
app.listen(PORT, () => {
  console.log(`Gran Hermano orchestrator running on port ${PORT}`);
});
