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
    const { data: displays, error } = await supabaseAdmin
      .from('carteleria_displays')
      .select('*')
      .eq('conjunto_id', session.conjuntoId)
      .order('nombre');

    if (error) { res.status(500).json({ error: 'Failed to fetch displays' }); return; }
    res.status(200).json(displays);
    return;
  }

  if (req.method === 'POST') {
    const { displayId, deviceId } = req.body;

    if (displayId) {
      const { error } = await supabaseAdmin
        .from('carteleria_displays')
        .update({ ultima_sincronizacion: new Date().toISOString(), estado: 'online' })
        .eq('id', displayId)
        .eq('conjunto_id', session.conjuntoId);

      if (error) { res.status(500).json({ error: 'Failed to sync display' }); return; }
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

  res.status(405).json({ error: 'Method not allowed' });
}
