import { createClient } from '@insforge/sdk';

const baseUrl = import.meta.env.VITE_INSFORGE_URL || process.env.INSFORGE_URL || 'https://6vgumkqu.us-east.insforge.app';
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || process.env.INSFORGE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExOTE1MjF9.I3BYeu3rwJCFR9EhsqMWY4M4Fp342MlahHhf-BcpNtY';

export const insforge = createClient({
  baseUrl,
  anonKey,
});
