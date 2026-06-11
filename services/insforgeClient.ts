import { createClient } from '@insforge/sdk';

const baseUrl = import.meta.env.VITE_INSFORGE_URL || process.env.INSFORGE_URL || 'https://6vgumkqu.us-east.insforge.app';
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || process.env.INSFORGE_ANON_KEY || '';

export const insforge = createClient({
  baseUrl,
  anonKey,
});
