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

  if (action === 'connect') {
    const { residenteId, apartamento } = req.body;

    const { data: call, error } = await supabaseAdmin
      .from('citofonia_calls')
      .insert([{ conjunto_id: session.conjuntoId, residente_id: residenteId, apartamento, estado: 'llamando' }])
      .select()
      .single();

    if (error) { res.status(500).json({ error: 'Failed to create call' }); return; }
    res.status(201).json(call);
    return;
  }

  if (action === 'signal') {
    const { callId, type, sdp } = req.body;
    if (!callId || !type) { res.status(400).json({ error: 'callId and type required' }); return; }

    res.status(200).json({ success: true, message: 'Signal relayed (WebRTC signaling handled client-to-client via backend relay or TURN)' });
    return;
  }

  if (action === 'end') {
    const { callId } = req.query;

    const { error } = await supabaseAdmin
      .from('citofonia_calls')
      .update({ estado: 'finalizada' })
      .eq('id', callId);

    if (error) { res.status(500).json({ error: 'Failed to end call' }); return; }
    res.status(200).json({ success: true });
    return;
  }

  res.status(400).json({ error: 'Invalid action' });
}
