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

  const { titulo, contenido, tipo, mediaUrl, prioridad, vigenteDesde, vigenteHasta } = req.body;

  if (!titulo) { res.status(400).json({ error: 'titulo is required' }); return; }

  const { data, error } = await supabaseAdmin
    .from('carteleria_contenidos')
    .insert([{
      conjunto_id: session.conjuntoId,
      titulo,
      contenido: contenido || '',
      tipo: tipo || 'texto',
      media_url: mediaUrl,
      prioridad: prioridad || 0,
      vigente_desde: vigenteDesde || new Date().toISOString(),
      vigente_hasta: vigenteHasta || null,
      estado: 'draft',
    }])
    .select()
    .single();

  if (error) { res.status(500).json({ error: 'Failed to create content' }); return; }
  res.status(201).json(data);
}
