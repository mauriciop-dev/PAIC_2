import React, { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-xs">
      <div className="flex items-start gap-3">
        <Icon name="bot" className="w-8 h-8 text-blue-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-sm">Instala PAIC</h3>
          <p className="text-xs text-gray-600 mt-1">
            Accede más rápido desde tu pantalla de inicio.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
            >
              Instalar
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
