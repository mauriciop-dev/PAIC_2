import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateUserSession } from '../../lib/auth/validate-conjunto';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { notifyResident } from '../../lib/notifications/push-service';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const authHeader = req.headers.authorization;
  const session = await validateUserSession(authHeader);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { visitanteNombre, visitanteDocumento, apartamento, residenteId } = req.body;

  if (!visitanteNombre || !apartamento || !residenteId) {
    res.status(400).json({ error: 'Missing required fields: visitanteNombre, apartamento, residenteId' });
    return;
  }

  const { data: autorizacion, error: insertError } = await supabaseAdmin
    .from('visita_autorizaciones')
    .insert([{
      conjunto_id: session.conjuntoId,
      visitante_id: visitanteDocumento || `temp-${Date.now()}`,
      residente_id: residenteId,
      apartamento,
      motivo: `Visita de ${visitanteNombre}`,
      autorizado: false,
    }])
    .select()
    .single();

  if (insertError) {
    console.error('Failed to create autorizacion:', insertError);
    res.status(500).json({ error: 'Failed to create authorization request' });
    return;
  }

  const sent = await notifyResident(residenteId, session.conjuntoId, {
    title: 'Solicitud de visita',
    body: `${visitanteNombre} está en la portería. ¿Autorizas su ingreso al apto ${apartamento}?`,
    tag: `visita-${autorizacion.id}`,
    actions: [
      { action: 'authorize', title: 'Autorizar' },
      { action: 'deny', title: 'Rechazar' },
    ],
  });

  res.status(200).json({
    success: true,
    autorizacionId: autorizacion.id,
    pushSent: sent,
  });
}
