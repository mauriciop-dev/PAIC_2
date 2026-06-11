import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateUserSession } from '../../lib/auth/validate-conjunto';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authHeader = req.headers.authorization;
  const session = await validateUserSession(authHeader);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { callId, type, sdp, candidate } = req.body;

  if (!callId) {
    res.status(400).json({ error: 'callId is required' });
    return;
  }

  if (type === 'offer' && sdp) {
    const { error } = await supabaseAdmin
      .from('citofonia_calls')
      .update({
        estado: 'connected',
      } as any)
      .eq('id', callId)
      .eq('conjunto_id', session.conjuntoId);

    if (error) {
      res.status(500).json({ error: 'Failed to process offer' });
      return;
    }

    res.status(200).json({ success: true, type: 'offer_ack' });
    return;
  }

  if (type === 'candidate' && candidate) {
    res.status(200).json({ success: true });
    return;
  }

  res.status(400).json({ error: 'Invalid signal payload' });
}
