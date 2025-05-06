import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
} else {
  console.log(`Supabase initialized with URL: ${supabaseUrl.substring(0, 15)}... and key: ${supabaseKey.substring(0, 5)}...`);
}

export const supabase = createClient(supabaseUrl, supabaseKey); 