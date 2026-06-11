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

  if (action === 'create') {
    const { titulo, contenido, tipo, mediaUrl, prioridad, vigenteDesde, vigenteHasta } = req.body;
    if (!titulo) { res.status(400).json({ error: 'titulo is required' }); return; }

    const { data, error } = await supabaseAdmin
      .from('carteleria_contenidos')
      .insert([{ conjunto_id: session.conjuntoId, titulo, contenido: contenido || '', tipo: tipo || 'texto', media_url: mediaUrl, prioridad: prioridad || 0, vigente_desde: vigenteDesde || new Date().toISOString(), vigente_hasta: vigenteHasta || null, estado: 'draft' }])
      .select()
      .single();

    if (error) { res.status(500).json({ error: 'Failed to create content' }); return; }
    res.status(201).json(data);
    return;
  }

  if (action === 'publish') {
    const { contenidoId, displayIds } = req.body;
    if (!contenidoId) { res.status(400).json({ error: 'contenidoId required' }); return; }

    const { error: pubError } = await supabaseAdmin
      .from('carteleria_contenidos')
      .update({ estado: 'published', updated_at: new Date().toISOString() })
      .eq('id', contenidoId)
      .eq('conjunto_id', session.conjuntoId);

    if (pubError) { res.status(500).json({ error: 'Failed to publish' }); return; }

    if (displayIds?.length) {
      await supabaseAdmin.from('carteleria_schedule').insert(
        displayIds.map((d: string, i: number) => ({ display_id: d, contenido_id: contenidoId, posicion: i }))
      );
    }

    res.status(200).json({ success: true });
    return;
  }

  if (action === 'schedule') {
    if (req.method === 'GET') {
      const displayId = req.query.displayId as string;
      let query = supabaseAdmin.from('carteleria_schedule').select('*, carteleria_contenidos(*)').eq('activo', true);
      if (displayId) query = query.eq('display_id', displayId);
      const { data: schedule, error } = await query.order('posicion', { ascending: true });
      if (error) { res.status(500).json({ error: 'Failed to fetch schedule' }); return; }
      res.status(200).json(schedule);
      return;
    }

    const { displayId, contenidoId, posicion, duracionSegundos } = req.body;
    if (!displayId || !contenidoId) { res.status(400).json({ error: 'displayId and contenidoId required' }); return; }

    const { data, error } = await supabaseAdmin
      .from('carteleria_schedule')
      .insert([{ display_id: displayId, contenido_id: contenidoId, posicion: posicion || 0, duracion_segundos: duracionSegundos || 30 }])
      .select()
      .single();

    if (error) { res.status(500).json({ error: 'Failed to create schedule entry' }); return; }
    res.status(201).json(data);
    return;
  }

  if (action === 'sync-list') {
    const { data: displays, error } = await supabaseAdmin
      .from('carteleria_displays')
      .select('*')
      .eq('conjunto_id', session.conjuntoId)
      .order('nombre');

    if (error) { res.status(500).json({ error: 'Failed to fetch displays' }); return; }
    res.status(200).json(displays);
    return;
  }

  if (action === 'sync-register') {
    const { displayId, deviceId } = req.body;

    if (displayId) {
      const { error } = await supabaseAdmin
        .from('carteleria_displays')
        .update({ ultima_sincronizacion: new Date().toISOString(), estado: 'online' })
        .eq('id', displayId)
        .eq('conjunto_id', session.conjuntoId);
      if (error) { res.status(500).json({ error: 'Failed to sync' }); return; }
      res.status(200).json({ success: true });
      return;
    }

    if (deviceId) {
      const { data, error } = await supabaseAdmin
        .from('carteleria_displays')
        .select('*, carteleria_schedule(*, carteleria_contenidos(*))')
        .eq('device_id', deviceId)
        .single();
      if (error) { res.status(404).json({ error: 'Display not found' }); return; }
      res.status(200).json(data);
      return;
    }

    res.status(400).json({ error: 'displayId or deviceId required' });
    return;
  }

  res.status(400).json({ error: 'Invalid action' });
}
