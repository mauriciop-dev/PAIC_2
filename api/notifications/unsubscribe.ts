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

  const { subscription_endpoint } = req.body;

  const query = supabaseAdmin
    .from('push_subscriptions')
    .delete()
    .eq('user_id', session.userId)
    .eq('conjunto_id', session.conjuntoId);

  if (subscription_endpoint) {
    query.eq('subscription_endpoint', subscription_endpoint);
  }

  const { error } = await query;

  if (error) {
    console.error('Failed to remove push subscription:', error);
    res.status(500).json({ error: 'Failed to remove subscription' });
    return;
  }

  res.status(200).json({ success: true });
}
