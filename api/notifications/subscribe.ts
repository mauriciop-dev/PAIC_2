import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateUserSession } from '../../lib/auth/validate-conjunto';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

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

  const { subscription_endpoint, auth_secret, p256dh } = req.body;
  if (!subscription_endpoint || !auth_secret || !p256dh) {
    res.status(400).json({ error: 'Missing subscription fields' });
    return;
  }

  const { error } = await supabaseAdmin.from('push_subscriptions').upsert({
    user_id: session.userId,
    conjunto_id: session.conjuntoId,
    subscription_endpoint,
    auth_secret,
    p256dh,
  }, { onConflict: 'subscription_endpoint' });

  if (error) {
    console.error('Failed to save push subscription:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
    return;
  }

  res.status(200).json({ success: true });
}
