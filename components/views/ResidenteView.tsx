import React, { useState, useEffect } from 'react';
import { ConjuntoInfo } from '../../types';
import { Icon } from '../ui/Icon';
import PushNotificationManager from '../pwa/PushNotificationManager';

interface ResidenteViewProps {
  userId: string;
  conjuntoId: string;
  conjuntoName: string;
  onOpenChat: () => void;
}

const ResidenteView: React.FC<ResidenteViewProps> = ({ userId, conjuntoId, conjuntoName, onOpenChat }) => {
  const [notifications, setNotifications] = useState<Array<{ title: string; body: string; time: string }>>([]);

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{conjuntoName}</h1>
          <p className="text-sm text-gray-500">Panel del Residente</p>
        </div>
        <button
          onClick={onOpenChat}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          aria-label="Abrir asistente"
        >
          <Icon name="bot" className="w-6 h-6" />
        </button>
      </div>

      <PushNotificationManager userId={userId} conjuntoId={conjuntoId} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Notificaciones</h2>
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="bell" className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm text-gray-500 mt-2">No hay notificaciones nuevas</p>
          </div>
        ) : (
          notifications.map((n, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{n.title}</p>
                <p className="text-xs text-gray-500">{n.body}</p>
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">{n.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ResidenteView;
