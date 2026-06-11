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

  const { residenteId, apartamento } = req.body;
  if (!residenteId || !apartamento) {
    res.status(400).json({ error: 'residenteId and apartamento are required' });
    return;
  }

  const { data: call, error } = await supabaseAdmin
    .from('citofonia_calls')
    .insert({
      conjunto_id: session.conjuntoId,
      residente_id: residenteId,
      porteria_user_id: session.userId,
      estado: 'pending',
    })
    .select('id')
    .single();

  if (error) {
    console.error('Failed to create citofonía call:', error);
    res.status(500).json({ error: 'Failed to create call' });
    return;
  }

  res.status(200).json({
    callId: call.id,
    offerNeeded: true,
  });
}
