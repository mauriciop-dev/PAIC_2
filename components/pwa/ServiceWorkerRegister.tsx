import React, { useEffect } from 'react';

const ServiceWorkerRegister: React.FC = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('SW registered:', registration.scope);

          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            console.log('Notification permission granted');
          }
        } catch (err) {
          console.warn('SW registration failed:', err);
        }
      });
    }
  }, []);

  return null;
};

export default ServiceWorkerRegister;
