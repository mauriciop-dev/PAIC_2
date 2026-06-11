import React from 'react';
import { Icon } from '../ui/Icon';

interface CartelPreviewProps {
  titulo: string;
  contenido: string;
  tipo: string;
  mediaUrl?: string;
}

const CartelPreview: React.FC<CartelPreviewProps> = ({ titulo, contenido, tipo, mediaUrl }) => {
  return (
    <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl overflow-hidden aspect-video flex items-center justify-center p-6">
      {tipo === 'imagen' && mediaUrl ? (
        <img src={mediaUrl} alt={titulo} className="absolute inset-0 w-full h-full object-cover" />
      ) : tipo === 'video' && mediaUrl ? (
        <video src={mediaUrl} className="absolute inset-0 w-full h-full object-cover" autoPlay muted loop playsInline />
      ) : null}

      <div className={`relative text-center ${tipo !== 'texto' ? 'bg-black/40 p-4 rounded-lg backdrop-blur-sm' : ''}`}>
        <h3 className="text-white font-bold text-lg md:text-2xl drop-shadow-lg">{titulo}</h3>
        {contenido && (
          <p className="text-white/90 text-sm md:text-base mt-2 drop-shadow-md">{contenido}</p>
        )}
      </div>

      {!titulo && !contenido && (
        <div className="text-center">
          <Icon name="monitor" className="w-12 h-12 text-white/50 mx-auto" />
          <p className="text-white/50 text-sm mt-2">Vista previa del cartel</p>
        </div>
      )}
    </div>
  );
};

export default CartelPreview;
