
import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Header from './components/Header';
import NavBar from './components/NavBar';
import LoginView from './components/views/LoginView';
import { Tab, UserProfile, ConjuntoInfo, UserRole, SuperAdminProfile, PlatformUser } from './types';
import { mapUserRole, isConjuntoAdmin as checkIsAdminRole } from './lib/auth/verify-permissions';
import { Icon } from './components/ui/Icon';
import { apiService } from './services/apiService';
import NotificationToast from './components/ui/NotificationToast';
import { syncAuthSession, clearAuthSession } from './lib/auth/session-sync';
import CommandPalette from './components/CommandPalette';
import ServiceWorkerRegister from './components/pwa/ServiceWorkerRegister';

const Dashboard = lazy(() => import('./components/Dashboard'));
const Chatbot = lazy(() => import('./components/Chatbot'));
const HelpModal = lazy(() => import('./components/HelpModal'));
const InitialSetupModal = lazy(() => import('./components/InitialSetupModal'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));
const SuperAdminDashboard = lazy(() => import('./components/views/SuperAdminDashboard'));
const PorteriaView = lazy(() => import('./components/views/PorteriaView'));
const ResidenteView = lazy(() => import('./components/views/ResidenteView'));
const AccessPointSelectionModal = lazy(() => import('./components/AccessPointSelectionModal'));
const OnboardingGuide = lazy(() => import('./components/OnboardingGuide'));

interface LoginError {
  title: string;
  message: string;
  type: 'sync' | 'config';
}

export type SettingsTab = 'Perfil' | 'Conjunto' | 'Puntos de Acceso' | 'Gestionar Áreas' | 'Suscripción' | 'Usuarios' | 'Permisos de Usuario';

interface LocalSession {
  user: {
    id: string;
    email?: string;
  };
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Dashboard);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isInitialSetupModalOpen, setIsInitialSetupModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAccessPointModalOpen, setIsAccessPointModalOpen] = useState(false);
  
  const [session, setSession] = useState<LocalSession | null | undefined>(undefined); // undefined means "not yet determined"
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [conjuntoInfo, setConjuntoInfo] = useState<ConjuntoInfo | null>(null);
  const [selectedAccessPointId, setSelectedAccessPointId] = useState<number | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [loginError, setLoginError] = useState<LoginError | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [initialSettingsTab, setInitialSettingsTab] = useState<SettingsTab>('Perfil');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    await clearAuthSession();
    setUserProfile(null);
    setConjuntoInfo(null);
    setSelectedAccessPointId(null);
    setLoginError(null);
    setSession(null);
  }, []);

  // Effect to catch specific configuration errors from the URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const errorDescription = params.get('error_description');

    if (errorDescription && errorDescription.includes('Database error saving new user')) {
      setLoginError({
        title: "Error de Configuración del Servidor",
        message: "No se pudo crear el perfil de usuario. Esto suele ocurrir si una cuenta fue eliminada y se intenta registrar de nuevo. Por favor, contacta a soporte técnico e informa del error 'DB_SAVE_USER_CONFLICT' para reactivar tu cuenta.",
        type: 'config',
      });
      setIsLoadingSession(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Keyboard shortcut: Ctrl+K to open command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (userProfile && (checkIsAdminRole(mapUserRole(userProfile.role)) || mapUserRole(userProfile.role) === 'internal')) {
          setIsCommandPaletteOpen(prev => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userProfile]);

  // Effect #1: Runs ONCE on mount. Gets the initial session via InsForge SDK
  // and syncs it with the Supabase client so DB queries work with RLS.
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (params.get('error_description')) {
        setIsLoadingSession(false);
        return;
    }

    const initSession = async () => {
      const synced = await syncAuthSession();
      if (synced) {
        setSession({ user: { id: synced.userId, email: synced.email, fullName: synced.fullName, avatarUrl: synced.avatarUrl } as any, access_token: '', refresh_token: '', expires_in: 0, expires_at: 0, token_type: 'bearer' });
      } else {
        setSession(null);
      }
    };

    initSession();
  }, []);

  // Effect #2: Runs whenever the `session` state changes. It is responsible for
  // fetching all user-dependent application data. This separation of concerns is key.
  useEffect(() => {
    // If session is `undefined`, it means the listener hasn't fired yet. We wait.
    if (session === undefined) {
        return;
    }

    // If session is `null`, the user is logged out. Clear all data and finish loading.
    if (session === null) {
        setUserProfile(null);
        setConjuntoInfo(null);
        setIsLoadingSession(false);
        return;
    }

    // A session exists. Fetch the corresponding application profile and data.
    let cancelled = false;

    const fetchProfileData = async () => {
        try {
            let profile = null;
            // Retry loop to handle DB replication lag after sign-up.
            for (let i = 0; i < 5; i++) {
                if (cancelled) return;
                profile = await apiService.fetchUserProfile(session.user.id);
                if (profile) break;
                console.warn(`Profile not found, retrying... Attempt ${i + 1}`);
                await new Promise(res => setTimeout(res, 2000));
            }

            if (cancelled) return;

            if (profile) {
                setUserProfile(profile);
                if (profile.conjuntoId) {
                    const info = await apiService.fetchConjuntoInfo(profile.conjuntoId);
                    if (cancelled) return;
                    if (info) {
                        setConjuntoInfo(info);
                    } else if (checkIsAdminRole(mapUserRole(profile.role))) {
                        setIsInitialSetupModalOpen(true);
                    }
                } else if (checkIsAdminRole(mapUserRole(profile.role))) {
                    setIsInitialSetupModalOpen(true);
                }
            } else {
                // First-time user: create profile with 14-day free trial
                try {
                    const newProfile: UserProfile = {
                        id: session.user.id,
                        email: session.user.email || '',
                        fullName: (session.user as any).fullName || session.user.email?.split('@')[0] || 'Usuario',
                        avatarUrl: (session.user as any).avatarUrl,
                        role: UserRole.Trial,
                        trialExpiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    };
                    await apiService.addUserProfile(newProfile);
                    setUserProfile(newProfile);
                    setIsInitialSetupModalOpen(true);
                } catch (error) {
                    console.error("Error creating user profile:", error);
                    setLoginError({
                        title: "Error al Registrar",
                        message: "Ocurrió un error al crear tu perfil. Por favor, intenta de nuevo o contacta a soporte.",
                        type: 'sync',
                    });
                    setUserProfile(null);
                    setConjuntoInfo(null);
                }
            }
        } catch (error) {
            console.error("Error fetching profile data:", error);
            setLoginError({
                title: "Error de Datos",
                message: "Ocurrió un error al cargar la información de tu cuenta. Por favor, intenta de nuevo.",
                type: 'sync',
            });
        } finally {
             if (!cancelled) {
                setIsLoadingSession(false);
            }
        }
    };

    fetchProfileData();

    return () => {
        cancelled = true;
    };
  }, [session]);
  
  // Effect to handle post-payment redirection
  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('collection_status');

      if (paymentStatus === 'approved' && userProfile && conjuntoInfo && conjuntoInfo.subscriptionPlan === 'Free') {
        try {
          window.history.replaceState({}, document.title, window.location.pathname);

          const updatedConjunto = { ...conjuntoInfo, subscriptionPlan: 'Paid' as const, planPrice: 140000 };
          await apiService.updateConjuntoInfo(updatedConjunto);
          
          const updatedProfile = { ...userProfile, role: UserRole.Subscriber };
          await apiService.updateUserProfile(updatedProfile);
          
          setConjuntoInfo(updatedConjunto);
          setUserProfile(updatedProfile);
          setNotification('¡Suscripción exitosa! Has mejorado al Plan Pro.');

        } catch (error) {
            console.error("Failed to update subscription status:", error);
            setNotification('Error al actualizar tu suscripción. Contacta a soporte.');
        }
      }
    };

    if(userProfile && conjuntoInfo) {
      handlePaymentSuccess();
    }
  }, [userProfile, conjuntoInfo]);

  useEffect(() => {
      if (userProfile && checkIsAdminRole(mapUserRole(userProfile.role)) && userProfile.conjuntoId) {
          const interval = setInterval(async () => {
              const logs = await apiService.fetchPackageLogs(userProfile.conjuntoId!);
              const lastLog = logs[0];
              if (lastLog && (!lastLog.id || Date.now() - new Date(lastLog.receivedDate).getTime() < 30000)) {
                  // New package notification handled via polling
              }
          }, 30000);

          return () => clearInterval(interval);
      }
  }, [userProfile]);
  
  // Effect for onboarding
  useEffect(() => {
    if (userProfile && !isLoadingSession) {
      const isAdminRole = checkIsAdminRole(mapUserRole(userProfile.role));
      if (isAdminRole) {
        const onboardingCompleted = localStorage.getItem(`onboardingCompleted-${userProfile.id}`);
        if (!onboardingCompleted) {
            setShowOnboarding(true);
        }
      }
    }
  }, [userProfile, isLoadingSession]);

  const handleOnboardingComplete = () => {
    if (userProfile) {
      localStorage.setItem(`onboardingCompleted-${userProfile.id}`, 'true');
    }
    setShowOnboarding(false);
  };
  
  const handleSaveSetup = async (info: ConjuntoInfo) => {
    if (!userProfile) return;
    
    try {
        // 1. Create conjunto info (DB auto-generates UUID, returns it)
        const newConjuntoId = await apiService.addConjuntoInfo(info);
        
        // 2. Update the user's profile with the new conjuntoId
        const updatedProfile: UserProfile = { ...userProfile, conjuntoId: newConjuntoId, fullName: info.adminName };
        await apiService.updateUserProfile(updatedProfile);

        // 3. Update local state
        setUserProfile(updatedProfile);
        setConjuntoInfo({ ...info, id: newConjuntoId });
        setIsInitialSetupModalOpen(false);
    } catch (error) {
        console.error("Error saving initial setup:", error);
        // Re-throw the error so the modal component can catch it and display a message.
        throw error;
    }
  };

  const handleSettingsClick = (tab: SettingsTab = 'Perfil') => {
    setInitialSettingsTab(tab);
    setIsSettingsModalOpen(true);
  };
  
  const handleInternalAuthSuccess = async (platformUser: PlatformUser) => {
      if (!platformUser.conjuntoId) return;

      const roles = await apiService.fetchRoles(platformUser.conjuntoId);
      const userRoleDef = roles.find(r => r.name === platformUser.role);

      let permissions: Tab[] = [];
      if (userRoleDef) {
          permissions = userRoleDef.permissions;
      } else {
          // Handle predefined static roles
          if (platformUser.role === 'Guard') {
              permissions = [Tab.Seguridad];
          } else if (platformUser.role === 'Contador') {
              permissions = [Tab.Finanzas];
          }
      }
      
      const profile: UserProfile = {
          id: `internal-${platformUser.id}`,
          fullName: platformUser.name,
          email: platformUser.email,
          role: UserRole.Internal,
          conjuntoId: platformUser.conjuntoId,
          permissions: permissions,
      };

      setUserProfile(profile);

      if (profile.conjuntoId) {
          const info = await apiService.fetchConjuntoInfo(profile.conjuntoId);
          if (info) setConjuntoInfo(info);
      }
  };

  if (isLoadingSession) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <Icon name="bot" className="w-12 h-12 text-blue-600 animate-pulse mx-auto"/>
                <p className="text-gray-600 mt-2">Cargando PAIC...</p>
            </div>
        </div>
      );
  }
  
  if (loginError) {
      return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white shadow-lg rounded-lg max-w-md mx-4">
                <Icon name="alert-triangle" className="w-12 h-12 text-red-500 mx-auto"/>
                <h2 className="text-xl font-bold text-gray-800 mt-4">
                    {loginError.title}
                </h2>
                <p className="text-gray-600 mt-2">{loginError.message}</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                    {loginError.type === 'sync' && (
                         <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                            Refrescar Página
                        </button>
                    )}
                    <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300">
                        Ir a Inicio
                    </button>
                </div>
            </div>
        </div>
      );
  }

  if (userProfile && mapUserRole(userProfile.role) === 'superadmin') {
      const superAdminProfile: SuperAdminProfile = { name: userProfile.fullName, email: userProfile.email, role: UserRole.Admin };
      return <Suspense fallback={<div className="flex h-screen items-center justify-center"><Icon name="bot" className="w-12 h-12 text-blue-600 animate-pulse" /></div>}><SuperAdminDashboard profile={superAdminProfile} onLogout={handleLogout} /></Suspense>;
  }

  if (!userProfile) {
    return <LoginView onInternalAuthSuccess={handleInternalAuthSuccess} />;
  }
  
  const conjuntoName = conjuntoInfo?.name || "Conjunto Residencial";
  const platformRole = mapUserRole(userProfile.role);
  const isConjuntoAdmin = checkIsAdminRole(platformRole);
  const needsAdminSetup = isConjuntoAdmin && !conjuntoInfo;

  if (platformRole === 'portero') {
    return <Suspense fallback={<div className="flex h-screen items-center justify-center"><Icon name="bot" className="w-12 h-12 text-blue-600 animate-pulse" /></div>}><PorteriaView conjuntoInfo={conjuntoInfo} conjuntoName={conjuntoName} /></Suspense>;
  }

  if (platformRole === 'residente') {
    return (
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><Icon name="bot" className="w-12 h-12 text-blue-600 animate-pulse" /></div>}>
        <ResidenteView
          userId={userProfile.id}
          conjuntoId={userProfile.conjuntoId || ''}
          conjuntoName={conjuntoName}
          onOpenChat={() => setIsChatbotOpen(true)}
        />
      </Suspense>
    );
  }

  return (
    <div className="flex h-screen font-sans text-gray-800 bg-gray-50">
      <ServiceWorkerRegister />
      <NotificationToast message={notification} onClose={() => setNotification(null)} />
      
      {isConjuntoAdmin && (
          <Suspense fallback={null}><Chatbot isOpen={isChatbotOpen} setIsOpen={setIsChatbotOpen} userProfile={userProfile} conjuntoInfo={conjuntoInfo} /></Suspense>
      )}
      
      {isConjuntoAdmin && (
        <div className={`fixed top-0 left-0 h-full z-20 transition-opacity duration-300 ease-in-out ${isChatbotOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <button id="chatbot-toggle-button" onClick={() => setIsChatbotOpen(true)} className="absolute top-1/2 -translate-y-1/2 left-0 w-8 h-auto bg-blue-600 text-white py-4 px-1 rounded-r-lg shadow-lg hover:bg-blue-700 flex flex-col items-center gap-2 animate-subtle-pulse" aria-label="Abrir asistente">
            <Icon name="bot" className="w-6 h-6" />
            <span style={{ writingMode: 'vertical-rl' }} className="font-semibold text-xs tracking-wider">ASISTENTE</span>
          </button>
        </div>
      )}

      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isChatbotOpen ? 'ml-0 md:ml-[30%]' : (isConjuntoAdmin ? 'ml-8' : 'ml-0')}`}>
        <Header 
            onHelpClick={() => setIsHelpModalOpen(true)} 
            userProfile={userProfile}
            conjuntoInfo={conjuntoInfo} 
            onLogout={handleLogout} 
            onSettingsClick={handleSettingsClick} 
            activeTabName={activeTab}
        />
        {!needsAdminSetup && <NavBar activeTab={activeTab} setActiveTab={setActiveTab} userProfile={userProfile} onSettingsClick={handleSettingsClick} />}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-100">
          {needsAdminSetup ? (
             <div className="text-center p-10 text-gray-600">
                <Icon name="settings" className="w-12 h-12 mx-auto text-gray-400" />
                <h2 className="text-xl font-semibold mt-4">Configuración Inicial Requerida</h2>
                <p className="mt-2">
                    Bienvenido a PAIC. Por favor, completa la información de tu conjunto en el diálogo que ha aparecido.
                </p>
            </div>
          ) : (
            <Suspense fallback={<div className="text-center p-10 text-gray-600">Cargando vista...</div>}><Dashboard activeTab={activeTab} setActiveTab={setActiveTab} conjuntoName={conjuntoName} userProfile={userProfile} conjuntoInfo={conjuntoInfo} selectedAccessPointId={selectedAccessPointId} /></Suspense>
          )}
        </div>
      </main>

      {isHelpModalOpen && <Suspense fallback={null}><HelpModal onClose={() => setIsHelpModalOpen(false)} onStartTour={() => { setIsHelpModalOpen(false); setShowOnboarding(true); }} /></Suspense>}
      
      {isInitialSetupModalOpen && (
        <Suspense fallback={null}>
          <InitialSetupModal 
              onClose={() => setIsInitialSetupModalOpen(false)} 
              onSaveSetup={handleSaveSetup} 
              userProfile={userProfile}
          />
        </Suspense>
      )}
      
      {isSettingsModalOpen && isConjuntoAdmin && conjuntoInfo && (
          <Suspense fallback={null}>
            <SettingsModal 
              isOpen={isSettingsModalOpen} 
              onClose={() => setIsSettingsModalOpen(false)} 
              userProfile={userProfile} 
              conjuntoInfo={conjuntoInfo} 
              initialTab={initialSettingsTab}
              setConjuntoInfo={setConjuntoInfo}
              setUserProfile={setUserProfile}
            />
          </Suspense>
      )}
      
       {isAccessPointModalOpen && userProfile.conjuntoId && (
        <Suspense fallback={null}>
          <AccessPointSelectionModal isOpen={isAccessPointModalOpen} onClose={() => setIsAccessPointModalOpen(false)} conjuntoId={userProfile.conjuntoId} onSelect={setSelectedAccessPointId} />
        </Suspense>
      )}
      
      <Suspense fallback={null}><OnboardingGuide isOpen={showOnboarding} onClose={handleOnboardingComplete} /></Suspense>
      
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        userProfile={userProfile}
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenChat={() => setIsChatbotOpen(true)}
        onOpenSettings={() => handleSettingsClick()}
      />
    </div>
  );
};

export default App;
