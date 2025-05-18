import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

// Connection monitoring
let lastConnectionAttempt = 0;
let connectionStatus = 'unknown';
let connectionErrors = 0;

// Create a client with auth timeout and auto refresh
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
    // Lower default JWT expiry threshold to prevent future date issues
    jwtExpiryMargin: 10, // 10 seconds
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'urban-greece-webapp',
    },
    // Set a reasonable timeout to prevent hanging requests
    fetch: async (url, options = {}) => {
      // Update connection stats
      lastConnectionAttempt = Date.now();
      
      // Create a timeout for the request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 5000); // 5 second timeout
      });
      
      try {
        // Race the fetch against a timeout
        const response = await Promise.race([
          fetch(url, {
            ...options,
            // Override cache control for better reliability
            cache: 'no-cache',
          }),
          timeoutPromise
        ]);
        
        // Check if the response is OK
        if (response.ok) {
          connectionStatus = 'connected';
          // Reset error counter on success
          connectionErrors = 0; 
        } else {
          connectionStatus = 'error';
          connectionErrors++;
          console.error(`Supabase API error: ${response.status} ${response.statusText}`);
        }
        
        return response;
      } catch (error) {
        // Network error
        connectionStatus = 'disconnected';
        connectionErrors++;
        console.error('Supabase connection error:', error);
        throw error;
      }
    }
  }
});

// Monitor session expiration
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Supabase auth token refreshed');
  } else if (event === 'SIGNED_OUT') {
    console.log('Supabase user signed out');
  }
});

// Health check function
export const checkSupabaseConnection = async () => {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.from('user_roles').select('count');
    const endTime = Date.now();
    
    return {
      status: error ? 'error' : 'connected',
      latency: endTime - startTime,
      timestamp: new Date().toISOString(),
      error: error ? error.message : null,
      errorCount: connectionErrors
    };
  } catch (e: any) {
    return {
      status: 'disconnected',
      error: e.message,
      timestamp: new Date().toISOString(),
      errorCount: connectionErrors
    };
  }
};

// Get connection status
export const getConnectionStatus = () => ({
  status: connectionStatus,
  lastAttempt: lastConnectionAttempt > 0 ? new Date(lastConnectionAttempt).toISOString() : null,
  errorCount: connectionErrors
}); 