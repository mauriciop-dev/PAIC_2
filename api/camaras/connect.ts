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

  const { camaraId, rtspUrl } = req.body;
  if (!camaraId && !rtspUrl) {
    res.status(400).json({ error: 'camaraId or rtspUrl required' });
    return;
  }

  const streamKey = `stream_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  if (camaraId) {
    const { error } = await supabaseAdmin
      .from('camaras')
      .update({ stream_key: streamKey, updated_at: new Date().toISOString() })
      .eq('id', camaraId)
      .eq('conjunto_id', session.conjuntoId);

    if (error) { res.status(500).json({ error: 'Failed to update camera stream key' }); return; }
  }

  res.status(200).json({ success: true, streamKey, serverUrl: process.env.MEDIAMTX_URL || '' });
}
