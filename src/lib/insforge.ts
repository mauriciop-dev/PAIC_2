import { createClient, createAdminClient } from "@insforge/sdk";

const INSFOGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL || "https://6vgumkqu.us-east.insforge.app";
const ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!;
const API_KEY = process.env.INSFORGE_API_KEY!;

export const insforge = createClient({
  baseUrl: INSFOGE_URL,
  anonKey: ANON_KEY,
});

export const adminInsforge = createAdminClient({
  baseUrl: INSFOGE_URL,
  apiKey: API_KEY,
});

export async function getInsforgeUser(token: string) {
  const { data, error } = await insforge.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}
