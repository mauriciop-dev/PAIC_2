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
    const { resuelta, severidad } = req.query;
    let query = supabaseAdmin
      .from('agent_alerts')
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

  if (req.method === 'POST') {
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

  res.status(405).json({ error: 'Method not allowed' });
}
