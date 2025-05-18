import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase admin credentials. Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY are set in your .env file');
}

// This client has admin privileges and bypasses RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey); 