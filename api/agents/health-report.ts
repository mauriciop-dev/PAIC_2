import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateUserSession } from '../../lib/auth/validate-conjunto';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const session = await validateUserSession(req.headers.authorization);
  if (!session) { res.status(401).json({ error: 'Unauthorized' }); return; }

  if (req.method === 'GET') {
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

  if (req.method === 'POST') {
    const { estadoGeneral, latenciaMs, detalles } = req.body;

    const { data, error } = await supabaseAdmin
      .from('health_reports')
      .insert([{
        conjunto_id: session.conjuntoId,
        estado_general: estadoGeneral || 'unknown',
        latencia_ms: latenciaMs || 0,
        detalles: detalles || {},
      }])
      .select()
      .single();

    if (error) { res.status(500).json({ error: 'Failed to create health report' }); return; }
    res.status(201).json(data);
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
