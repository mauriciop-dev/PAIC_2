import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.INSFORGE_URL || 'https://vgmwlzhlpehuvfkgqzja.supabase.co';
const supabaseServiceKey = process.env.INSFORGE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl) {
  console.warn("INSFORGE_URL is not set in backend environment variables.");
}

if (!supabaseServiceKey) {
  console.warn("INSFORGE_SERVICE_ROLE_KEY is not set in backend environment variables.");
}

// Admin client to bypass RLS safely in trusted backend contexts (e.g., loading config, logging usage)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || 'placeholder');
