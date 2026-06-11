import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateUserSession } from '../../lib/auth/validate-conjunto';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'GET') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const session = await validateUserSession(req.headers.authorization);
  if (!session) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const [agents, alerts, health] = await Promise.all([
    supabaseAdmin.from('agent_registry').select('*').order('nombre'),
    supabaseAdmin.from('agent_alerts').select('*').eq('resuelta', false).order('created_at', { ascending: false }).limit(50),
    supabaseAdmin.from('health_reports').select('*').order('created_at', { ascending: false }).limit(10),
  ]);

  res.status(200).json({
    timestamp: new Date().toISOString(),
    agents: agents.data || [],
    activeAlerts: alerts.data || [],
    recentHealthReports: health.data || [],
    stats: {
      totalAgents: agents.data?.length || 0,
      onlineAgents: agents.data?.filter((a) => a.estado === 'online').length || 0,
      activeAlerts: alerts.data?.length || 0,
      criticalAlerts: alerts.data?.filter((a) => a.severidad === 'critica').length || 0,
    },
  });
}
