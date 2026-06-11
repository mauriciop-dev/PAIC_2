import React, { useState } from 'react';
import { UserProfile, ConjuntoInfo } from '../../types';
import CartelEditor from '../cartelera/CartelEditor';
import CartelPreview from '../cartelera/CartelPreview';
import ScheduleManager from '../cartelera/ScheduleManager';
import { supabase } from '../../services/supabaseClient';

interface CarteleriaViewProps {
  userProfile: UserProfile;
  conjuntoInfo: ConjuntoInfo;
}

const CarteleriaView: React.FC<CarteleriaViewProps> = ({ userProfile, conjuntoInfo }) => {
  const [lastSaved, setLastSaved] = useState<{ titulo: string; contenido: string; tipo: string; mediaUrl?: string } | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (data: { titulo: string; contenido: string; tipo: string; mediaUrl?: string }) => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/carteleria/create-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          titulo: data.titulo,
          contenido: data.contenido,
          tipo: data.tipo,
          mediaUrl: data.mediaUrl,
        }),
      });

      if (response.ok) {
        setLastSaved(data);
      }
    } catch (err) {
      console.error('Failed to create cartel content:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Cartelería Digital — {conjuntoInfo.name}</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Crear nuevo cartel</h3>
            <CartelEditor onSave={handleSave} />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Vista previa</h3>
            {lastSaved ? (
              <CartelPreview {...lastSaved} />
            ) : (
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl aspect-video flex items-center justify-center">
                <p className="text-white/60 text-sm">Crea un cartel para ver la vista previa</p>
              </div>
            )}
            {saving && (
              <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                <span className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                Guardando...
              </p>
            )}
            {lastSaved && !saving && (
              <p className="text-xs text-green-600 mt-2">✓ Guardado como borrador</p>
            )}
          </div>
        </div>
      </div>

      <ScheduleManager />
    </div>
  );
};

export default CarteleriaView;
