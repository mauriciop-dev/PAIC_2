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

  const { camaraId, frameData } = req.body;
  if (!camaraId || !frameData) {
    res.status(400).json({ error: 'camaraId and frameData required' });
    return;
  }

  const { data: camara, error: camError } = await supabaseAdmin
    .from('camaras')
    .select('id')
    .eq('id', camaraId)
    .eq('conjunto_id', session.conjuntoId)
    .single();

  if (camError || !camara) { res.status(404).json({ error: 'Camera not found' }); return; }

  res.status(200).json({
    processed: true,
    message: 'Frame received for processing. Vision AI processing is handled by external service.',
    camaraId,
    frameSizeBytes: frameData.length,
  });
}
