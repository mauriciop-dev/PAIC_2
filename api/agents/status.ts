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
    const { data: agents, error } = await supabaseAdmin
      .from('agent_registry')
      .select('*')
      .order('nombre');

    if (error) { res.status(500).json({ error: 'Failed to fetch agents' }); return; }
    res.status(200).json(agents);
    return;
  }

  if (req.method === 'POST') {
    const { agentId, estado } = req.body;
    if (!agentId || !estado) {
      res.status(400).json({ error: 'agentId and estado required' });
      return;
    }

    const { error } = await supabaseAdmin
      .from('agent_registry')
      .update({ estado, ultimo_heartbeat: new Date().toISOString() })
      .eq('id', agentId);

    if (error) { res.status(500).json({ error: 'Failed to update agent status' }); return; }
    res.status(200).json({ success: true });
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
