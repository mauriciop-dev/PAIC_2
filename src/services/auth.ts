import { insforge } from "@/lib/insforge";

export async function signInWithGoogle() {
  const { data, error } = await insforge.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await insforge.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await insforge.auth.getSession();
  if (error) return null;
  return data.session;
}
