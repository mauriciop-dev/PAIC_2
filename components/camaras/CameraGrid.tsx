import React, { useState, useEffect } from 'react';
import { Icon } from '../ui/Icon';
import LiveFeed from './LiveFeed';

interface Camara {
  id: string;
  nombre: string;
  ubicacion: string;
  activa: boolean;
  stream_key: string | null;
}

interface CameraGridProps {
  conjuntoId: string;
}

const CameraGrid: React.FC<CameraGridProps> = ({ conjuntoId }) => {
  const [cameras, setCameras] = useState<Camara[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', ubicacion: '', rtspUrl: '' });

  useEffect(() => {
    fetchCameras();
  }, [conjuntoId]);

  const fetchCameras = async () => {
    try {
      const response = await fetch('/api/camaras?action=lpr-list');
      setCameras([]);
    } catch {
      // Placeholder — API returns LPR events not cameras
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowAddForm(false);
    setFormData({ nombre: '', ubicacion: '', rtspUrl: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          {selectedCamera ? 'Transmisión en vivo' : 'Cámaras'}
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Icon name="user-plus" className="w-4 h-4" />
          Agregar cámara
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
          <input
            type="text"
            placeholder="Nombre (ej: Entrada Principal)"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            required
          />
          <input
            type="text"
            placeholder="Ubicación (ej: Portón vehicular)"
            value={formData.ubicacion}
            onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="text"
            placeholder="URL RTSP (ej: rtsp://user:pass@192.168.1.100:554/stream)"
            value={formData.rtspUrl}
            onChange={(e) => setFormData({ ...formData, rtspUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            required
          />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Guardar
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {selectedCamera ? (
        <div>
          <button
            onClick={() => setSelectedCamera(null)}
            className="text-sm text-blue-600 hover:text-blue-700 mb-3 flex items-center gap-1"
          >
            <Icon name="x" className="w-4 h-4" /> Volver a cuadrícula
          </button>
          <LiveFeed cameraId={selectedCamera} />
        </div>
      ) : cameras.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Icon name="camera" className="w-16 h-16 text-gray-300 mx-auto" />
          <p className="text-gray-500 mt-4">No hay cámaras configuradas</p>
          <p className="text-sm text-gray-400 mt-1">
            Agrega una cámara RTSP para comenzar a monitorear
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cameras.map((cam) => (
            <button
              key={cam.id}
              onClick={() => setSelectedCamera(cam.id)}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-left hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-gray-800">{cam.nombre}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{cam.ubicacion}</p>
                </div>
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cam.activa ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cam.activa ? 'bg-green-500' : 'bg-red-500'}`} />
                  {cam.activa ? 'En vivo' : 'Inactiva'}
                </span>
              </div>
              <div className="mt-3 aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <Icon name="camera" className="w-8 h-8 text-gray-400" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CameraGrid;
