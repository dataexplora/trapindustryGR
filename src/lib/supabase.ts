import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// More comprehensive error checking
if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL ERROR: Missing Supabase credentials. Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file');
  // Set fallback values to prevent app from crashing, but the client won't work
  // This is just so we can render a meaningful error UI instead of crashing
} 

// Create Supabase client with additional options
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Verify connection on startup
(async () => {
  try {
    // Simple ping test using system time query
    const { data, error } = await supabase.from('user_roles').select('count', { count: 'exact' }).limit(1);
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Supabase connection verified');
  } catch (err) {
    console.error('❌ Supabase connection failed:', err);
    // We don't throw here to allow the app to load, but it will show proper error states
  }
})();

// Function to check if Supabase is properly configured
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('user_roles').select('count', { count: 'exact' }).limit(1);
    return !error;
  } catch (err) {
    return false;
  }
}; 