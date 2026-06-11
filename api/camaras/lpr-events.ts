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
    const { data: events, error } = await supabaseAdmin
      .from('lpr_events')
      .select('*')
      .eq('conjunto_id', session.conjuntoId)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) { res.status(500).json({ error: 'Failed to fetch LPR events' }); return; }
    res.status(200).json(events);
    return;
  }

  if (req.method === 'POST') {
    const { placa, confianza, accion, imagenUrl } = req.body;
    if (!placa) { res.status(400).json({ error: 'placa required' }); return; }

    const { data, error } = await supabaseAdmin
      .from('lpr_events')
      .insert([{ conjunto_id: session.conjuntoId, placa, confianza, accion, imagen_url: imagenUrl }])
      .select()
      .single();

    if (error) { res.status(500).json({ error: 'Failed to create LPR event' }); return; }
    res.status(201).json(data);
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
