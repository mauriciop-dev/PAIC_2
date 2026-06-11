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

  if (action === 'process-frame') {
    const { camaraId, frameData } = req.body;
    if (!camaraId || !frameData) {
      res.status(400).json({ error: 'camaraId and frameData required' });
      return;
    }

    const { data: camara, error: camError } = await supabaseAdmin
      .from('camaras').select('id').eq('id', camaraId).eq('conjunto_id', session.conjuntoId).single();

    if (camError || !camara) { res.status(404).json({ error: 'Camera not found' }); return; }

    res.status(200).json({ processed: true, message: 'Frame received for processing', camaraId, frameSizeBytes: frameData.length });
    return;
  }

  if (action === 'lpr-recognize') {
    const { imageData, camaraId } = req.body;
    if (!imageData) { res.status(400).json({ error: 'imageData required' }); return; }

    res.status(200).json({ success: true, message: 'LPR recognition request received', plates: [] });
    return;
  }

  res.status(400).json({ error: 'Invalid action' });
}
