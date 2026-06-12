import { insforge } from '../../services/insforgeClient';

export interface SyncedSession {
  userId: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

export async function syncAuthSession(): Promise<SyncedSession | null> {
  const userResult = await insforge.auth.getCurrentUser();
  if (!userResult.data?.user) return null;

  const user = userResult.data.user;

  return {
    userId: user.id,
    email: user.email,
    fullName: user.profile?.name || user.email?.split('@')[0] || 'Usuario',
    avatarUrl: user.profile?.avatar_url || undefined,
  };
}

export async function clearAuthSession() {
  await insforge.auth.signOut();
}
