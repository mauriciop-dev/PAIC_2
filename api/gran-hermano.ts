import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateUserSession } from '../lib/auth/validate-conjunto';
import { supabaseAdmin } from '../lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const session = await validateUserSession(req.headers.authorization);
  if (!session) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const action = (req.query.action as string) || '';

  if (action === 'metrics') {
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
    return;
  }

  if (action === 'alerts-list') {
    const { resuelta, severidad } = req.query;
    let query = supabaseAdmin.from('agent_alerts')
      .select('*, agent_registry(nombre, tipo)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (resuelta === 'false') query = query.eq('resuelta', false);
    if (resuelta === 'true') query = query.eq('resuelta', true);
    if (severidad) query = query.eq('severidad', severidad);

    const { data: alerts, error } = await query;
    if (error) { res.status(500).json({ error: 'Failed to fetch alerts' }); return; }
    res.status(200).json(alerts);
    return;
  }

  if (action === 'alerts-resolve') {
    const { alertId } = req.body;
    if (!alertId) { res.status(400).json({ error: 'alertId required' }); return; }

    const { error } = await supabaseAdmin
      .from('agent_alerts')
      .update({ resuelta: true, resuelta_at: new Date().toISOString() })
      .eq('id', alertId);

    if (error) { res.status(500).json({ error: 'Failed to resolve alert' }); return; }
    res.status(200).json({ success: true });
    return;
  }

  res.status(400).json({ error: 'Invalid action' });
}
