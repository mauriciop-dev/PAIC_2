import React from 'react';
import { Icon } from '../ui/Icon';

interface NotificacionVisitaProps {
  visitanteNombre: string;
  apartamento: string;
  onAccept: () => void;
  onDecline: () => void;
  onClose: () => void;
}

const NotificacionVisita: React.FC<NotificacionVisitaProps> = ({
  visitanteNombre,
  apartamento,
  onAccept,
  onDecline,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
            <Icon name="users" className="w-8 h-8 text-blue-600" />
          </div>

          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-800">Visita en portería</h2>
            <p className="text-sm text-gray-500 mt-1">
              {visitanteNombre} espera en la portería para ingresar al apartamento.
            </p>
          </div>

          <div className="w-full bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500">Apartamento</p>
            <p className="text-lg font-bold text-gray-800">{apartamento}</p>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={onDecline}
              className="flex-1 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
            >
              Rechazar
            </button>
            <button
              onClick={onAccept}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Autorizar
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificacionVisita;
