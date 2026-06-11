import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';

interface PushNotificationManagerProps {
  userId: string;
  conjuntoId: string;
}

const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({ userId, conjuntoId }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch {
      setIsSubscribed(false);
    }
  };

  const subscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.VITE_VAPID_PUBLIC_KEY || (window as any).__VAPID_PUBLIC_KEY || '';

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const { error } = await supabase.from('push_subscriptions').insert([{
        user_id: userId,
        conjunto_id: conjuntoId,
        subscription_endpoint: subscription.endpoint,
        auth_secret: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
      }]);

      if (error) {
        console.error('Failed to save push subscription:', error);
        return;
      }

      setIsSubscribed(true);
    } catch (err) {
      console.error('Failed to subscribe to push:', err);
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('conjunto_id', conjuntoId);

      if (error) {
        console.error('Failed to remove push subscription:', error);
        return;
      }

      setIsSubscribed(false);
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
    }
  };

  if (!isSupported) return null;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div>
        <p className="text-sm font-medium text-gray-800">Notificaciones Push</p>
        <p className="text-xs text-gray-500">
          {permission === 'denied'
            ? 'Bloqueaste las notificaciones. Actívalas desde la configuración del navegador.'
            : isSubscribed
              ? 'Recibirás notificaciones en segundo plano.'
              : 'Actívalas para recibir alertas de visitas y paquetes.'}
        </p>
      </div>
      {permission !== 'denied' && (
        <button
          onClick={isSubscribed ? unsubscribe : subscribe}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            isSubscribed
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubscribed ? 'Desactivar' : 'Activar'}
        </button>
      )}
    </div>
  );
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export default PushNotificationManager;
