import React from 'react';
import { UserProfile } from '../../types';
import CameraGrid from '../camaras/CameraGrid';
import LPRDetector from '../camaras/LPRDetector';
import AlertaAnomalias from '../camaras/AlertaAnomalias';

interface CamarasViewProps {
  userProfile: UserProfile;
}

const CamarasView: React.FC<CamarasViewProps> = ({ userProfile }) => {
  return (
    <div className="space-y-6">
      <CameraGrid conjuntoId={userProfile.conjuntoId || ''} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LPRDetector />
        <AlertaAnomalias />
      </div>
    </div>
  );
};

export default CamarasView;
