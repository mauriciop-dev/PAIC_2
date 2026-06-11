import { supabaseAdmin } from '../supabaseAdmin';

interface PushNotificationPayload {
  title: string;
  body: string;
  tag?: string;
  actions?: Array<{ action: string; title: string }>;
}

export async function sendPushNotification(
  subscription: { subscription_endpoint: string; auth_secret: string; p256dh: string },
  notification: PushNotificationPayload
): Promise<boolean> {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

  if (!vapidPublicKey || !vapidPrivateKey) {
    console.warn('VAPID keys not configured. Push notifications disabled.');
    return false;
  }

  try {
    const response = await fetch(subscription.subscription_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TTL': '86400',
      },
      body: JSON.stringify({
        title: notification.title,
        body: notification.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: notification.tag || 'default',
        requireInteraction: true,
        actions: notification.actions || [],
      }),
    });

    return response.ok;
  } catch (err) {
    console.error('Push notification error:', err);
    return false;
  }
}

export async function notifyResident(
  residenteId: string,
  conjuntoId: string,
  notification: PushNotificationPayload
): Promise<boolean> {
  const { data: subscriptions, error } = await supabaseAdmin
    .from('push_subscriptions')
    .select('subscription_endpoint, auth_secret, p256dh')
    .eq('user_id', residenteId)
    .eq('conjunto_id', conjuntoId);

  if (error || !subscriptions?.length) {
    console.warn('No push subscriptions found for resident:', residenteId);
    return false;
  }

  const results = await Promise.allSettled(
    subscriptions.map((sub) => sendPushNotification(sub, notification))
  );

  if (subscriptions.length > 0) {
    const { error: updateError } = await supabaseAdmin
      .from('push_subscriptions')
      .update({ last_used: new Date().toISOString() })
      .eq('user_id', residenteId);

    if (updateError) {
      console.warn('Failed to update push subscription last_used:', updateError);
    }
  }

  return results.some((r) => r.status === 'fulfilled' && r.value);
}
