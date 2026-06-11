import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateUserSession } from '../../lib/auth/validate-conjunto';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const session = await validateUserSession(req.headers.authorization);
  if (!session) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const { contenidoId, displayIds } = req.body;
  if (!contenidoId) { res.status(400).json({ error: 'contenidoId is required' }); return; }

  const { data: contenido, error: fetchError } = await supabaseAdmin
    .from('carteleria_contenidos')
    .select('id')
    .eq('id', contenidoId)
    .eq('conjunto_id', session.conjuntoId)
    .single();

  if (fetchError || !contenido) { res.status(404).json({ error: 'Content not found' }); return; }

  const { error: updateError } = await supabaseAdmin
    .from('carteleria_contenidos')
    .update({ estado: 'published', updated_at: new Date().toISOString() })
    .eq('id', contenidoId);

  if (updateError) { res.status(500).json({ error: 'Failed to publish content' }); return; }

  if (displayIds && displayIds.length > 0) {
    const scheduleEntries = displayIds.map((displayId: string, index: number) => ({
      display_id: displayId,
      contenido_id: contenidoId,
      posicion: index,
      duracion_segundos: 30,
    }));

    const { error: scheduleError } = await supabaseAdmin
      .from('carteleria_schedule')
      .insert(scheduleEntries);

    if (scheduleError) { console.error('Failed to create schedule entries:', scheduleError); }
  }

  res.status(200).json({ success: true, published: true });
}
