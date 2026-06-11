
import React, { lazy, Suspense } from 'react';
import { Tab, UserProfile, ConjuntoInfo } from '../types';

const DashboardView = lazy(() => import('./views/DashboardView'));
const DatabaseView = lazy(() => import('./views/DatabaseView'));
const CommonAreasView = lazy(() => import('./views/CommonAreasView'));
const DueDatesView = lazy(() => import('./views/DueDatesView'));
const PendingTasksView = lazy(() => import('./views/PendingTasksView'));
const ComunicacionesView = lazy(() => import('./views/ComunicacionesView'));
const ArchivosView = lazy(() => import('./views/ArchivosView'));
const FinanzasView = lazy(() => import('./views/FinanzasView'));
const SeguridadView = lazy(() => import('./views/SeguridadView'));
const CamarasView = lazy(() => import('./views/CamarasView'));
const CarteleriaView = lazy(() => import('./views/CarteleriaView'));
const GranHermanoView = lazy(() => import('./views/GranHermanoView'));

interface DashboardProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  conjuntoName: string;
  userProfile: UserProfile;
  conjuntoInfo: ConjuntoInfo | null;
  selectedAccessPointId: number | null;
}

const Dashboard: React.FC<DashboardProps> = ({ activeTab, setActiveTab, conjuntoName, userProfile, conjuntoInfo, selectedAccessPointId }) => {
  const renderContent = () => {
    // The loading/setup state is now handled by the parent App component, making this one cleaner.
    // We can assume conjuntoInfo is valid when this component's content is rendered.
    if (!conjuntoInfo) {
        return <div className="text-center p-10">Cargando información del conjunto...</div>;
    }
      
    switch (activeTab) {
      case Tab.Dashboard:
        return <DashboardView setActiveTab={setActiveTab} userProfile={userProfile} />;
      case Tab.Database:
        return <DatabaseView userProfile={userProfile} />;
      case Tab.CommonAreas:
        return <CommonAreasView userProfile={userProfile} />;
      case Tab.DueDates:
        return <DueDatesView userProfile={userProfile} />;
      case Tab.PendingTasks:
          return <PendingTasksView userProfile={userProfile} />;
      case Tab.Comunicaciones:
          return <ComunicacionesView userProfile={userProfile} conjuntoInfo={conjuntoInfo} />;
      case Tab.Archivos:
          return <ArchivosView userProfile={userProfile} conjuntoInfo={conjuntoInfo} />;
      case Tab.Finanzas:
          return <FinanzasView userProfile={userProfile} />;
      case Tab.Seguridad:
          return <SeguridadView userProfile={userProfile} selectedAccessPointId={selectedAccessPointId} />;
      case Tab.Camaras:
          return <CamarasView userProfile={userProfile} />;
      case Tab.Carteleria:
          return <CarteleriaView userProfile={userProfile} conjuntoInfo={conjuntoInfo} />;
      case Tab.GranHermano:
          return <GranHermanoView userProfile={userProfile} />;
      default:
        return <DashboardView setActiveTab={setActiveTab} userProfile={userProfile} />;
    }
  };

  return <div className="w-full h-full"><Suspense fallback={<div className="text-center p-10 text-gray-600">Cargando...</div>}>{renderContent()}</Suspense></div>;
};

export default Dashboard;