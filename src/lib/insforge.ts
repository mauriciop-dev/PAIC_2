import { createClient, createAdminClient } from "@insforge/sdk";

const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://6vgumkqu.us-east.insforge.app';
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExOTE1MjF9.I3BYeu3rwJCFR9EhsqMWY4M4Fp342MlahHhf-BcpNtY';

export const insforge = createClient({
  baseUrl,
  anonKey,
});

export const adminInsforge = createAdminClient({
  baseUrl,
  apiKey: process.env.INSFORGE_API_KEY || process.env.INSFORGE_SERVICE_ROLE_KEY || 'ik_0c583c8afce18d60e07b27074f62d368',
});