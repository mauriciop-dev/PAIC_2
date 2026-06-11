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
    const { camaraId } = req.body;
    const streamKey = `stream_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (camaraId) {
      const { error } = await supabaseAdmin
        .from('camaras')
        .update({ stream_key: streamKey, updated_at: new Date().toISOString() })
        .eq('id', camaraId)
        .eq('conjunto_id', session.conjuntoId);
      if (error) { res.status(500).json({ error: 'Failed to update camera' }); return; }
    }

    res.status(200).json({ success: true, streamKey, serverUrl: process.env.MEDIAMTX_URL || '' });
    return;
  }

  if (action === 'stream') {
    const camaraId = req.query.camaraId as string;
    if (!camaraId) { res.status(400).json({ error: 'camaraId required' }); return; }

    const { data: camara, error } = await supabaseAdmin
      .from('camaras')
      .select('stream_key, rtsp_url')
      .eq('id', camaraId)
      .eq('conjunto_id', session.conjuntoId)
      .single();

    if (error || !camara) { res.status(404).json({ error: 'Camera not found' }); return; }
    res.status(200).json({ streamUrl: camara.stream_key ? `${process.env.MEDIAMTX_URL || ''}/hls/${camara.stream_key}.m3u8` : camara.rtsp_url });
    return;
  }

  if (action === 'snapshot') {
    const { camaraId } = req.body;
    if (!camaraId) { res.status(400).json({ error: 'camaraId required' }); return; }

    const { data: camara, error } = await supabaseAdmin
      .from('camaras')
      .select('id, stream_key')
      .eq('id', camaraId)
      .eq('conjunto_id', session.conjuntoId)
      .single();

    if (error || !camara) { res.status(404).json({ error: 'Camera not found' }); return; }
    res.status(200).json({ snapshotUrl: `${process.env.SNAPSHOT_API_URL || ''}/capture/${camara.stream_key || camara.id}` });
    return;
  }

  if (action === 'lpr-list') {
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

  if (action === 'lpr-create') {
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

  res.status(400).json({ error: 'Invalid action' });
}
