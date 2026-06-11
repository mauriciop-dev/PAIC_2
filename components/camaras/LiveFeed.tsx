import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '../ui/Icon';

interface LiveFeedProps {
  cameraId: string;
}

const LiveFeed: React.FC<LiveFeedProps> = ({ cameraId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'loading' | 'playing' | 'error'>('loading');

  useEffect(() => {
    setStatus('loading');
    const video = videoRef.current;
    if (!video) return;

    const onCanPlay = () => setStatus('playing');
    const onError = () => setStatus('error');

    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('error', onError);
      video.pause();
      video.src = '';
    };
  }, [cameraId]);

  return (
    <div className="bg-black rounded-xl overflow-hidden relative aspect-video">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        autoPlay
        muted
        playsInline
        controls={false}
      />

      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white text-sm mt-2">Conectando...</p>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
          <div className="text-center">
            <Icon name="alert-triangle" className="w-10 h-10 text-yellow-400 mx-auto" />
            <p className="text-white text-sm mt-2">No se pudo conectar con la cámara</p>
            <p className="text-gray-400 text-xs mt-1">Verifica que la URL RTSP sea accesible</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveFeed;
