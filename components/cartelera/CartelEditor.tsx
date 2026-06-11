import React, { useState } from 'react';
import { Icon } from '../ui/Icon';

interface CartelEditorProps {
  onSave: (data: { titulo: string; contenido: string; tipo: string; mediaUrl?: string }) => void;
}

const CartelEditor: React.FC<CartelEditorProps> = ({ onSave }) => {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [tipo, setTipo] = useState('texto');
  const [mediaUrl, setMediaUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ titulo, contenido, tipo, mediaUrl: mediaUrl || undefined });
    setTitulo('');
    setContenido('');
    setTipo('texto');
    setMediaUrl('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-gray-500 mb-1">Título del cartel</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Ej: Recordatorio cuota de administración"
          required
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Tipo de contenido</label>
        <div className="flex gap-2">
          {[
            { id: 'texto', label: 'Texto', icon: 'file-text' },
            { id: 'imagen', label: 'Imagen', icon: 'image' },
            { id: 'video', label: 'Video', icon: 'play-circle' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTipo(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tipo === opt.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon name={opt.icon} className="w-3.5 h-3.5" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">Contenido</label>
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
          placeholder="Escribe el mensaje del cartel..."
          required
        />
      </div>

      {tipo !== 'texto' && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">URL del {tipo === 'imagen' ? 'media' : 'video'}</label>
          <input
            type="url"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={tipo === 'imagen' ? 'https://ejemplo.com/imagen.jpg' : 'https://ejemplo.com/video.mp4'}
          />
        </div>
      )}

      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
      >
        Crear cartel
      </button>
    </form>
  );
};

export default CartelEditor;
