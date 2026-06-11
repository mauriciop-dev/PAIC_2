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

  if (action === 'status') {
    if (req.method === 'POST') {
      const { agentId, estado } = req.body;
      if (!agentId || !estado) { res.status(400).json({ error: 'agentId and estado required' }); return; }

      const { error } = await supabaseAdmin
        .from('agent_registry')
        .update({ estado, ultimo_heartbeat: new Date().toISOString() })
        .eq('id', agentId);

      if (error) { res.status(500).json({ error: 'Failed to update agent status' }); return; }
      res.status(200).json({ success: true });
      return;
    }

    const { data: agents, error } = await supabaseAdmin
      .from('agent_registry').select('*').order('nombre');

    if (error) { res.status(500).json({ error: 'Failed to fetch agents' }); return; }
    res.status(200).json(agents);
    return;
  }

  if (action === 'health-report') {
    if (req.method === 'POST') {
      const { estadoGeneral, latenciaMs, detalles } = req.body;
      const { data, error } = await supabaseAdmin
        .from('health_reports')
        .insert([{ conjunto_id: session.conjuntoId, estado_general: estadoGeneral || 'unknown', latencia_ms: latenciaMs || 0, detalles: detalles || {} }])
        .select()
        .single();

      if (error) { res.status(500).json({ error: 'Failed to create health report' }); return; }
      res.status(201).json(data);
      return;
    }

    const { data: reports, error } = await supabaseAdmin
      .from('health_reports')
      .select('*, agent_registry(nombre, tipo)')
      .eq('conjunto_id', session.conjuntoId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) { res.status(500).json({ error: 'Failed to fetch health reports' }); return; }
    res.status(200).json(reports);
    return;
  }

  if (action === 'trigger-diagnostic') {
    const { agentType, target } = req.body;

    const { error } = await supabaseAdmin
      .from('agent_alerts')
      .insert([{
        tipo: 'diagnostic_triggered', severidad: 'media',
        mensaje: `Diagnóstico manual solicitado para ${agentType || 'sistema'}${target ? ` en ${target}` : ''}`,
        metadata: { agentType, target, triggeredBy: session.userId },
      }]);

    if (error) { res.status(500).json({ error: 'Failed to trigger diagnostic' }); return; }
    res.status(200).json({ success: true, message: `Diagnóstico iniciado para ${agentType || 'sistema'}` });
    return;
  }

  res.status(400).json({ error: 'Invalid action' });
}
