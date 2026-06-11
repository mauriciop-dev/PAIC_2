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
    const displayId = req.query.displayId as string;
    let query = supabaseAdmin
      .from('carteleria_schedule')
      .select('*, carteleria_contenidos(*)')
      .eq('activo', true);

    if (displayId) query = query.eq('display_id', displayId);

    const { data: schedule, error } = await query.order('posicion', { ascending: true });

    if (error) { res.status(500).json({ error: 'Failed to fetch schedule' }); return; }
    res.status(200).json(schedule);
    return;
  }

  if (req.method === 'POST') {
    const { displayId, contenidoId, posicion, duracionSegundos } = req.body;
    if (!displayId || !contenidoId) {
      res.status(400).json({ error: 'displayId and contenidoId required' });
      return;
    }

    const { data, error } = await supabaseAdmin
      .from('carteleria_schedule')
      .insert([{
        display_id: displayId,
        contenido_id: contenidoId,
        posicion: posicion || 0,
        duracion_segundos: duracionSegundos || 30,
      }])
      .select()
      .single();

    if (error) { res.status(500).json({ error: 'Failed to create schedule entry' }); return; }
    res.status(201).json(data);
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
