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

  const { callId } = req.body;
  if (!callId) {
    res.status(400).json({ error: 'callId is required' });
    return;
  }

  const now = new Date();
  const { data: call, error: fetchError } = await supabaseAdmin
    .from('citofonia_calls')
    .select('inicio')
    .eq('id', callId)
    .eq('conjunto_id', session.conjuntoId)
    .single();

  if (fetchError || !call) {
    res.status(404).json({ error: 'Call not found' });
    return;
  }

  const duracion = Math.floor((now.getTime() - new Date(call.inicio).getTime()) / 1000);

  const { error } = await supabaseAdmin
    .from('citofonia_calls')
    .update({
      fin: now.toISOString(),
      duracion_segundos: duracion,
      estado: 'ended',
    })
    .eq('id', callId);

  if (error) {
    console.error('Failed to end citofonía call:', error);
    res.status(500).json({ error: 'Failed to end call' });
    return;
  }

  res.status(200).json({ success: true, duracion });
}
