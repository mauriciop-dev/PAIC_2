import { createAdminClient } from '@insforge/sdk';

const baseUrl = process.env.INSFORGE_URL || 'https://6vgumkqu.us-east.insforge.app';
const apiKey = process.env.INSFORGE_API_KEY || 'ik_0c583c8afce18d60e07b27074f62d368';

if (!process.env.INSFORGE_URL) {
  console.warn("INSFORGE_URL is not set in backend environment variables.");
}
if (!process.env.INSFORGE_API_KEY) {
  console.warn("INSFORGE_API_KEY is not set in backend environment variables.");
}

export const insforgeAdmin = createAdminClient({
  baseUrl,
  apiKey,
});
