import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateUserSession } from '../lib/auth/validate-conjunto';
import { supabaseAdmin } from '../lib/supabaseAdmin';
import { notifyResident } from '../lib/notifications/push-service';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const session = await validateUserSession(req.headers.authorization);
  if (!session) { res.status(401).json({ error: 'Unauthorized' }); return; }

  const action = (req.query.action as string) || '';

  if (action === 'subscribe') {
    const { subscription_endpoint, auth_secret, p256dh } = req.body;
    if (!subscription_endpoint || !auth_secret || !p256dh) {
      res.status(400).json({ error: 'Missing subscription fields' });
      return;
    }

    const { error } = await supabaseAdmin.from('push_subscriptions').upsert({
      user_id: session.userId, conjunto_id: session.conjuntoId,
      subscription_endpoint, auth_secret, p256dh,
    }, { onConflict: 'subscription_endpoint' });

    if (error) { res.status(500).json({ error: 'Failed to save subscription' }); return; }
    res.status(200).json({ success: true });
    return;
  }

  if (action === 'unsubscribe') {
    const { subscription_endpoint } = req.body;
    const query = supabaseAdmin.from('push_subscriptions').delete().eq('user_id', session.userId).eq('conjunto_id', session.conjuntoId);
    if (subscription_endpoint) query.eq('subscription_endpoint', subscription_endpoint);

    const { error } = await query;
    if (error) { res.status(500).json({ error: 'Failed to remove subscription' }); return; }
    res.status(200).json({ success: true });
    return;
  }

  if (action === 'send-push') {
    const { residenteId, title, body, tag, actions: pushActions } = req.body;
    if (!residenteId || !title || !body) {
      res.status(400).json({ error: 'Missing required fields: residenteId, title, body' });
      return;
    }

    const sent = await notifyResident(residenteId, session.conjuntoId, {
      title, body, tag: tag || `push-${Date.now()}`, actions: pushActions || [],
    });

    if (!sent) { res.status(404).json({ error: 'No push subscriptions found' }); return; }
    res.status(200).json({ success: true });
    return;
  }

  if (action === 'solicitar-autorizacion') {
    const { visitanteNombre, visitanteDocumento, apartamento, residenteId } = req.body;
    if (!visitanteNombre || !apartamento || !residenteId) {
      res.status(400).json({ error: 'Missing required fields: visitanteNombre, apartamento, residenteId' });
      return;
    }

    const { data: autorizacion, error: insertError } = await supabaseAdmin
      .from('visita_autorizaciones')
      .insert([{ conjunto_id: session.conjuntoId, visitante_id: visitanteDocumento || `temp-${Date.now()}`, residente_id: residenteId, apartamento, motivo: `Visita de ${visitanteNombre}`, autorizado: false }])
      .select()
      .single();

    if (insertError) { res.status(500).json({ error: 'Failed to create authorization request' }); return; }

    const sent = await notifyResident(residenteId, session.conjuntoId, {
      title: 'Solicitud de visita',
      body: `${visitanteNombre} está en la portería. ¿Autorizas su ingreso al apto ${apartamento}?`,
      tag: `visita-${autorizacion.id}`,
      actions: [{ action: 'authorize', title: 'Autorizar' }, { action: 'deny', title: 'Rechazar' }],
    });

    res.status(200).json({ success: true, autorizacionId: autorizacion.id, pushSent: sent });
    return;
  }

  res.status(400).json({ error: 'Invalid action' });
}
