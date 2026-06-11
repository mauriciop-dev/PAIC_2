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

  const { agentType, target } = req.body;

  const { error } = await supabaseAdmin
    .from('agent_alerts')
    .insert([{
      tipo: 'diagnostic_triggered',
      severidad: 'media',
      mensaje: `Diagnóstico manual solicitado para ${agentType || 'sistema'}${target ? ` en ${target}` : ''}`,
      metadata: { agentType, target, triggeredBy: session.userId },
    }]);

  if (error) { res.status(500).json({ error: 'Failed to trigger diagnostic' }); return; }

  res.status(200).json({
    success: true,
    message: `Diagnóstico iniciado para ${agentType || 'sistema'}`,
  });
}
