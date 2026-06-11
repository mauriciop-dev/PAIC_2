import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateUserSession } from '../../lib/auth/validate-conjunto';
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

  const { residenteId, title, body, tag, actions } = req.body;

  if (!residenteId || !title || !body) {
    res.status(400).json({ error: 'Missing required fields: residenteId, title, body' });
    return;
  }

  const sent = await notifyResident(residenteId, session.conjuntoId, {
    title,
    body,
    tag: tag || `push-${Date.now()}`,
    actions: actions || [],
  });

  if (!sent) {
    res.status(404).json({ error: 'No push subscriptions found for resident' });
    return;
  }

  res.status(200).json({ success: true });
}
