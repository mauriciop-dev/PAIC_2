import { insforge } from "@/lib/insforge";

export async function signInWithGoogle() {
  const { data, error } = await insforge.auth.signInWithOAuth(
    "google",
    { redirectTo: `${window.location.origin}/auth/callback` },
  );
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await insforge.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const { data, error } = await insforge.auth.getCurrentUser();
  if (error) return null;
  return data.user;
}
