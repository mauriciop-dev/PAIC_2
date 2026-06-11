import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://vgmwlzhlpehuvfkgqzja.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnbXdsemhscGVodXZma2dxemphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2OTA5MjQsImV4cCI6MjA3ODI2NjkyNH0.g1_wvl3tauVNdiEBOFD_yzXexXJu5ErEuCUJ3tnUKlE';

export const supabase = createClient(supabaseUrl, supabaseKey);