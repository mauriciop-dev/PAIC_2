import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '../ui/Icon';

interface ComunicacionWebRTCProps {
  callId: string;
  role: 'portero' | 'residente';
  onEnd: () => void;
}

const ComunicacionWebRTC: React.FC<ComunicacionWebRTCProps> = ({ callId, role, onEnd }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [duration, setDuration] = useState(0);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      try {
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        });
        peerRef.current = pc;

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
          video: false,
        });

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        if (localAudioRef.current) {
          localAudioRef.current.srcObject = stream;
        }

        pc.ontrack = (event) => {
          if (localAudioRef.current && event.streams[0]) {
            localAudioRef.current.srcObject = event.streams[0];
          }
        };

        pc.oniceconnectionstatechange = () => {
          if (pc.iceConnectionState === 'connected' && !cancelled) {
            setStatus('connected');
            timerRef.current = setInterval(() => {
              setDuration((d) => d + 1);
            }, 1000);
          }
        };

        if (role === 'portero') {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          await fetch('/api/citofonia?action=signal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ callId, type: 'offer', sdp: offer.sdp }),
          });
        }
      } catch (err) {
        console.error('WebRTC setup failed:', err);
        if (!cancelled) setStatus('ended');
      }
    };

    setup();

    return () => {
      cancelled = true;
      clearInterval(timerRef.current);
      peerRef.current?.close();
    };
  }, [callId, role]);

  const handleEnd = async () => {
    clearInterval(timerRef.current);
    peerRef.current?.close();
    setStatus('ended');
    onEnd();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
        status === 'connected' ? 'bg-green-100' : 'bg-blue-100'
      }`}>
        <Icon name="phone" className={`w-8 h-8 ${
          status === 'connected' ? 'text-green-600' : 'text-blue-600'
        }`} />
      </div>

      <audio ref={localAudioRef} autoPlay />

      <p className="text-lg font-semibold text-gray-800">
        {status === 'connecting' && 'Conectando...'}
        {status === 'connected' && `En llamada ${formatTime(duration)}`}
        {status === 'ended' && 'Llamada finalizada'}
      </p>

      {status !== 'ended' && (
        <button
          onClick={handleEnd}
          className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
          aria-label="Colgar"
        >
          <Icon name="phone-off" className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default ComunicacionWebRTC;
