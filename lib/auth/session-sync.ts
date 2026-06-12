import { insforge } from '../../services/insforgeClient';
import { supabase } from '../../services/supabaseClient';

export interface SyncedSession {
  userId: string;
  email?: string;
}

export async function syncAuthSession(): Promise<SyncedSession | null> {
  const userResult = await insforge.auth.getCurrentUser();
  if (!userResult.data?.user) return null;

  const user = userResult.data.user;
  const { data } = await insforge.auth.refreshSession();

  if (data?.accessToken) {
    await supabase.auth.setSession({
      access_token: data.accessToken,
      refresh_token: '',
    });
  }

  return {
    userId: user.id,
    email: user.email,
  };
}

export async function clearAuthSession() {
  await insforge.auth.signOut();
  await supabase.auth.signOut();
}
