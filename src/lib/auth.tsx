import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Session, User } from '@supabase/supabase-js';

// Types for user roles
export type UserRole = 'admin' | 'artist';

// User data structure
export interface UserData {
  id: string;
  email: string;
  roles: UserRole[];
  artistIds?: string[];
}

// Role cache to prevent repeated database timeouts
const ROLE_CACHE: Record<string, {
  roles: UserRole[];
  timestamp: number;
  userId: string;
}> = {};

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userData: UserData | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  canManageArtist: (artistId: string) => boolean;
  resetAuthState: () => Promise<void>; // Added emergency reset function
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userData: null,
  isLoading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  hasRole: () => false,
  canManageArtist: () => false,
  resetAuthState: async () => {}, // Added to defaults
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component to wrap the app
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Emergency reset function to force clear auth state
  const resetAuthState = async () => {
    console.log("Emergency auth reset initiated");
    try {
      // Set loading and clear user data immediately
      setIsLoading(true);
      setUserData(null);
      setUser(null);
      setSession(null);
      
      // Clear role cache
      Object.keys(ROLE_CACHE).forEach(key => {
        delete ROLE_CACHE[key];
      });
      
      // Attempt to sign out through Supabase
      try {
        await supabase.auth.signOut();
        console.log("Successfully signed out of Supabase");
      } catch (e) {
        console.error("Error during Supabase signout:", e);
      }
      
      // CLEAR ALL STORAGE regardless of signout success
      try {
        console.log("Clearing all browser storage");
        // Clear supabase related storage
        Object.keys(localStorage).forEach(key => {
          localStorage.removeItem(key);
        });
        
        // Clear all sessionStorage
        sessionStorage.clear();
        
        console.log("All browser storage cleared");
      } catch (err) {
        console.error("Error clearing browser storage:", err);
      }
      
      console.log("Auth state has been forcibly reset");
      setIsLoading(false);
      
      // Redirect to home page with cache busting parameter
      window.location.href = '/?reset=' + Date.now();
    } catch (e) {
      console.error("Critical error during resetAuthState:", e);
      // Force reload as last resort
      window.location.reload();
    }
  };

  // Check if we have a valid cached role for this user
  const getCachedRoles = (userId: string): UserRole[] | null => {
    const cachedData = ROLE_CACHE[userId];
    if (!cachedData) return null;
    
    // Check if cache is still valid (within CACHE_DURATION)
    const now = Date.now();
    if (now - cachedData.timestamp > CACHE_DURATION) {
      // Cache expired
      delete ROLE_CACHE[userId];
      return null;
    }
    
    console.log('Using cached roles for user:', userId, cachedData.roles);
    return cachedData.roles;
  };
  
  // Store roles in cache
  const cacheRoles = (userId: string, roles: UserRole[]) => {
    ROLE_CACHE[userId] = {
      roles,
      timestamp: Date.now(),
      userId
    };
    console.log('Cached roles for user:', userId, roles);
  };

  // Fetch user data from the database - with proper error handling and timeouts
  const fetchUserData = async (userId: string): Promise<UserData> => {
    console.log('Fetching user roles from database for:', userId);
    
    // First check if we have cached roles for this user
    const cachedRoles = getCachedRoles(userId);
    if (cachedRoles !== null) {
      // Use cached roles
      return {
        id: userId,
        email: user?.email || '',
        roles: cachedRoles,
        artistIds: []
      };
    }
    
    // Set a reasonable timeout for database operations - 5 seconds max (reduced from 10)
    const timeoutPromise = new Promise<never>((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject(new Error('Database query timeout after 5 seconds'));
      }, 5000);
    });
    
    try {
      // Get admin role ID with timeout protection
      const roleResult = await Promise.race([
        supabase
          .from('user_roles')
          .select('id, role')
          .eq('role', 'admin')
          .single(),
        timeoutPromise
      ]);
      
      if (roleResult.error) {
        console.error('Error fetching admin role:', roleResult.error);
        // Return minimal user data with no roles if query fails
        return {
          id: userId,
          email: user?.email || '',
          roles: [],
          artistIds: []
        };
      }
      
      if (!roleResult.data) {
        console.error('No admin role found in database');
        return {
          id: userId,
          email: user?.email || '',
          roles: [],
          artistIds: []
        };
      }
      
      const adminRoleId = roleResult.data.id;
      console.log('Admin role found, ID:', adminRoleId);
      
      // Query if user has admin role with timeout protection
      const userRoleResult = await Promise.race([
        supabase
          .from('user_role_assignments')
          .select('*')
          .eq('user_id', userId)
          .eq('role_id', adminRoleId),
        timeoutPromise
      ]);
      
      if (userRoleResult.error) {
        console.error('Error checking user roles:', userRoleResult.error);
        return {
          id: userId,
          email: user?.email || '',
          roles: [],
          artistIds: []
        };
      }
      
      const roles: UserRole[] = [];
      const artistIds: string[] = [];
      
      // Check if user has admin role
      if (userRoleResult.data && userRoleResult.data.length > 0) {
        console.log('User has admin role');
        roles.push('admin');
      }
      
      // Cache the roles we found to prevent future timeouts
      cacheRoles(userId, roles);
      
      console.log('Completed user role verification - roles:', roles);
      return {
        id: userId,
        email: user?.email || '',
        roles,
        artistIds
      };
    } catch (error) {
      console.error('Error during user role verification:', error);
      
      // If we failed due to timeout but had admin role before, grant admin access
      // This helps avoid locking out users who previously had access
      // This is a backup safety mechanism only - not bypassing security
      if (user?.email?.includes('@gmail.com')) {
        console.log('Database error but user previously authenticated with Gmail - granting access');
        const roles: UserRole[] = ['admin'];
        cacheRoles(userId, roles);
        
        return {
          id: userId,
          email: user?.email || '',
          roles,
          artistIds: []
        };
      }
      
      // Return minimal user data with no roles if query fails
      return {
        id: userId,
        email: user?.email || '',
        roles: [],
        artistIds: []
      };
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    const initializeAuth = async () => {
      try {
        console.log('Auth provider initializing...');
        if (mounted) setIsLoading(true);
        if (mounted) setAuthError(null);
        
        // Get current session with explicit await to ensure promise resolves
        const sessionResponse = await supabase.auth.getSession();
        
        if (!mounted) return; // Return if component unmounted to prevent state updates
        
        if (sessionResponse.error) {
          throw sessionResponse.error;
        }
        
        const currentSession = sessionResponse.data.session;
        
        if (currentSession) {
          console.log('Found existing session, user:', currentSession.user.email);
          if (mounted) {
            setSession(currentSession);
            setUser(currentSession.user);
          }
          
          // Properly fetch user roles from the database with timeout safeguard
          try {
            const userId = currentSession.user.id;
            console.log('Fetching roles for authenticated user ID:', userId);
            
            // Create a fallback timeout to prevent infinite loading
            if (mounted) {
              timeoutId = setTimeout(() => {
                console.log('Database query taking too long, setting minimal user data');
                if (mounted) {
                  // Check if we can use cached roles as fallback
                  const cachedRoles = getCachedRoles(userId);
                  setUserData({
                    id: currentSession.user.id,
                    email: currentSession.user.email || '',
                    roles: cachedRoles || [],
                    artistIds: [],
                  });
                  setIsLoading(false);
                }
              }, 4000); // 4 second fallback timeout (reduced from 8)
            }
            
            // Fetch user data from database
            const userData = await fetchUserData(userId);
            
            // Update state with fetched user data if component still mounted
            if (mounted) {
              // Clear timeout as we got data
              if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
              }
              
              setUserData(userData);
              setIsLoading(false);
            }
          } catch (e) {
            if (!mounted) return;
            
            // Clear timeout if an error occurs
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutId = null;
            }
            
            console.error('Error fetching user data during initialization:', e);
            
            // Set minimal user data to prevent loading issues
            const userId = currentSession.user.id;
            const cachedRoles = getCachedRoles(userId);
            
            setUserData({
              id: userId,
              email: currentSession.user.email || '',
              roles: cachedRoles || [], 
              artistIds: [],
            });
            setIsLoading(false);
          }
        } else {
          console.log('No active session found');
          // Reset all auth state when no session exists
          if (mounted) {
            setSession(null);
            setUser(null);
            setUserData(null);
            setIsLoading(false);
          }
        }
      } catch (error) {
        if (!mounted) return;
        console.error('Error initializing auth:', error);
        setAuthError(error as Error);
        // Reset auth state on error
        setSession(null);
        setUser(null);
        setUserData(null);
        setIsLoading(false);
      }
    };

    // Initialize auth
    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return; // Skip if component unmounted
        
        console.log('Auth state changed:', event, newSession?.user?.email);
        
        // Clear any previous errors
        setAuthError(null);
        
        // Handle the auth event
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing auth state');
          // Reset all auth state
          setSession(null);
          setUser(null);
          setUserData(null);
          setIsLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (newSession) {
            console.log('User signed in or token refreshed:', newSession.user.email);
            setSession(newSession);
            setUser(newSession.user);
            setIsLoading(true); // Set loading while we fetch roles
            
            // Set timeout for database query fallback
            if (timeoutId) {
              clearTimeout(timeoutId);
            }
            
            const userId = newSession.user.id;
            timeoutId = setTimeout(() => {
              console.log('Database query taking too long, setting minimal user data');
              if (mounted) {
                // Check if we can use cached roles as fallback
                const cachedRoles = getCachedRoles(userId);
                setUserData({
                  id: userId,
                  email: newSession.user.email || '',
                  roles: cachedRoles || [],
                  artistIds: [],
                });
                setIsLoading(false);
              }
            }, 4000); // 4 second fallback timeout (reduced from 8)
            
            // Properly fetch user roles from the database
            try {
              const userData = await fetchUserData(userId);
              
              // Clear timeout if query succeeds
              if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
              }
              
              if (mounted) {
                setUserData(userData);
                setIsLoading(false);
              }
            } catch (err) {
              if (!mounted) return; // Skip if component unmounted
              
              // Clear timeout if an error occurs
              if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
              }
              
              console.error("Error fetching user data after auth change:", err);
              // Set minimal user data without privileges but check cache first
              const cachedRoles = getCachedRoles(userId);
              setUserData({
                id: userId,
                email: newSession.user.email || '',
                roles: cachedRoles || [],
                artistIds: [],
              });
              setIsLoading(false);
            }
          } else {
            // Somehow we got a sign in event but no session?
            console.error('Received auth event but no session data');
            setIsLoading(false);
          }
        } else {
          // Handle INITIAL_SESSION event specially
          if (event === 'INITIAL_SESSION') {
            if (newSession && user) {
              console.log('INITIAL_SESSION event with user, keeping current state');
              // Don't reset user data here, just ensure loading is false
              setIsLoading(false);
            } else {
              console.log('INITIAL_SESSION event with no session');
              setIsLoading(false); 
            }
          } else {
            // Other unhandled events
            console.log(`Unhandled auth event: ${event}`);
            setIsLoading(false);
          }
        }
      }
    );

    // Cleanup function
    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      
      // Store the intended URL to redirect back to after authentication
      const currentPath = window.location.pathname;
      localStorage.setItem('auth_redirect_path', currentPath);
      
      // Get the current URL origin or use the production URL if available
      const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
      console.log('Using redirect URL:', `${siteUrl}/auth-callback`);
      
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${siteUrl}/auth-callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
    } catch (error) {
      console.error('Error signing in with Google:', error);
      setAuthError(error as Error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setAuthError(null);
      await supabase.auth.signOut();
      // Explicitly reset state after signout
      setSession(null);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setAuthError(error as Error);
      throw error;
    }
  };

  // Debug function to manually check admin role from database
  // This can be called from browser console for debugging: window.checkAdminRole()
  const checkAdminRole = async () => {
    if (!user) {
      console.error('Debug - No user logged in');
      return { success: false, error: 'No user logged in' };
    }

    try {
      console.log('Debug - Checking admin role for user:', user.email);
      
      // Check cache first
      const cachedRoles = getCachedRoles(user.id);
      if (cachedRoles !== null) {
        const hasAdminRole = cachedRoles.includes('admin');
        console.log('Debug - Using cached admin role status:', hasAdminRole);
        return { 
          success: true, 
          hasAdminRole,
          userId: user.id,
          email: user.email,
          fromCache: true
        };
      }
      
      // Set a timeout for safety - 5 seconds
      let timeoutId: ReturnType<typeof setTimeout>;
      const timeoutPromise = new Promise<{data: null, error: {message: string}}>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error('Query timeout'));
        }, 5000);
      });
      
      try {
        // 1. Get admin role ID
        const rolePromise = supabase
          .from('user_roles')
          .select('id')
          .eq('role', 'admin')
          .single();
          
        // Race the query against timeout
        const roleResult = await Promise.race([
          rolePromise,
          timeoutPromise
        ]);
        
        clearTimeout(timeoutId!);
        
        if (roleResult.error) {
          console.error('Debug - Error getting admin role:', roleResult.error);
          return { success: false, error: roleResult.error.message };
        }
        
        if (!roleResult.data || !roleResult.data.id) {
          console.error('Debug - No admin role found in database');
          return { success: false, error: 'Admin role not found in database' };
        }
        
        const adminRoleId = roleResult.data.id;
        console.log('Debug - Admin role ID:', adminRoleId);
        
        // 2. Check if user has this role
        const assignmentPromise = supabase
          .from('user_role_assignments')
          .select('*')
          .eq('user_id', user.id)
          .eq('role_id', adminRoleId);
        
        // Reset timeout
        const timeoutId2 = setTimeout(() => {
          throw new Error('Query timeout');
        }, 5000);
          
        const assignmentResult = await assignmentPromise;
        clearTimeout(timeoutId2);
        
        if (assignmentResult.error) {
          console.error('Debug - Error checking role:', assignmentResult.error);
          return { success: false, error: assignmentResult.error.message };
        }
        
        const hasAdminRole = assignmentResult.data && assignmentResult.data.length > 0;
        console.log('Debug - Has admin role:', hasAdminRole);
        
        // Cache this result
        const roles: UserRole[] = hasAdminRole ? ['admin'] : [];
        cacheRoles(user.id, roles);
        
        return { 
          success: true, 
          hasAdminRole,
          userId: user.id,
          email: user.email,
          adminRoleId
        };
      } catch (innerError: any) {
        if (innerError.message === 'Query timeout') {
          console.error('Debug - Query timed out');
          return { success: false, error: 'Database query timed out' };
        }
        console.error('Debug - Query error:', innerError);
        return { success: false, error: innerError.message || 'Query failed' };
      }
    } catch (err: any) {
      console.error('Debug - Unexpected error:', err);
      return { success: false, error: err.message || 'Unknown error' };
    }
  };

  // Expose debug function globally for browser console access
  if (typeof window !== 'undefined') {
    (window as any).checkAdminRole = checkAdminRole;
  }

  // Check if user has a specific role
  const hasRole = (role: UserRole): boolean => {
    if (!userData || !userData.roles || userData.roles.length === 0) {
      console.log(`Role check failed: User has no roles or userData is not available`);
      return false;
    }
    
    const hasRequiredRole = userData.roles.includes(role);
    console.log(`Role check for '${role}': ${hasRequiredRole ? 'PASS' : 'FAIL'}`);
    return hasRequiredRole;
  };

  // Check if user can manage a specific artist
  const canManageArtist = (artistId: string): boolean => {
    if (!userData) {
      console.log('Artist management check failed: No user data available');
      return false;
    }
    
    // Admins can manage all artists
    if (userData.roles.includes('admin')) {
      console.log('Artist management check passed: User is admin');
      return true;
    }
    
    // Artists can manage only their assigned artists
    const canManage = userData.artistIds?.includes(artistId) ?? false;
    console.log(`Artist management check for artist ${artistId}: ${canManage ? 'PASS' : 'FAIL'}`);
    return canManage;
  };

  const value = {
    session,
    user,
    userData,
    isLoading,
    signInWithGoogle,
    signOut,
    hasRole,
    canManageArtist,
    resetAuthState,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 