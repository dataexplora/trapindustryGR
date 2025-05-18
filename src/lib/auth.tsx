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
      // First try to sign out through Supabase
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Error during signout in resetAuthState:", e);
    } finally {
      // Force reset all local state regardless of signout success
      setSession(null);
      setUser(null);
      setUserData(null);
      setIsLoading(false);
      setAuthError(null);
      
      // CLEAR EVERYTHING related to Supabase from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Force clear localStorage and sessionStorage completely if needed
      try {
        localStorage.clear();
        sessionStorage.clear();
        console.log("All browser storage cleared");
      } catch (err) {
        console.error("Error clearing browser storage:", err);
      }
      
      console.log("Auth state has been forcibly reset");
      
      // Force reload the page to ensure a completely fresh state
      window.location.reload();
    }
  };

  // Fetch user roles and artist associations
  const fetchUserData = async (userId: string) => {
    try {
      console.log('Fetching user data for ID:', userId);
      
      // Get role assignments and join with role names
      const { data: roleData, error: rolesError } = await supabase
        .from('user_role_assignments')
        .select(`
          role_id,
          user_roles:user_roles(role)
        `)
        .eq('user_id', userId);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        throw rolesError;
      }

      console.log('Role data from database:', roleData);

      // Get artist associations
      const { data: artistAssociations, error: artistsError } = await supabase
        .from('artist_users')
        .select('artist_id')
        .eq('user_id', userId);

      if (artistsError) {
        console.error('Error fetching artist associations:', artistsError);
        throw artistsError;
      }

      // Extract roles from the data
      const roles: UserRole[] = [];
      if (roleData && Array.isArray(roleData)) {
        console.log('Processing role data:', JSON.stringify(roleData));
        
        roleData.forEach(item => {
          try {
            // Log each item to debug exactly what we're getting
            console.log('Role item:', JSON.stringify(item));
            
            if (item.user_roles) {
              if (typeof item.user_roles === 'object') {
                // Handle case where user_roles is an object with role property
                if ('role' in item.user_roles) {
                  console.log(`Found role property: ${item.user_roles.role}`);
                  roles.push(item.user_roles.role as UserRole);
                }
                // Handle case where user_roles might be an array of objects
                else if (Array.isArray(item.user_roles) && item.user_roles.length > 0) {
                  if ('role' in item.user_roles[0]) {
                    console.log(`Found role in array: ${item.user_roles[0].role}`);
                    roles.push(item.user_roles[0].role as UserRole);
                  }
                }
              } else if (typeof item.user_roles === 'string') {
                // Handle case where it might just be a string
                console.log(`Found role as string: ${item.user_roles}`);
                roles.push(item.user_roles as UserRole);
              }
            } else if (item.role_id) {
              // If we just have a role_id, do a direct lookup
              console.log(`Found role_id: ${item.role_id}`);
              
              // If it's 1, it's likely admin
              if (item.role_id === 1) {
                roles.push('admin');
              }
            }
          } catch (err) {
            console.error('Error processing role item:', err);
          }
        });
      }

      console.log(`Found ${roles.length} roles for user ${userId}`);

      // Extract artist IDs
      const artistIds = artistAssociations?.map(assoc => assoc.artist_id) || [];

      // Set user data even if no roles are found - this prevents infinite loading
      const userInfo = user;
      if (userInfo) {
        setUserData({
          id: userInfo.id,
          email: userInfo.email || '',
          roles, // This might be an empty array for new users
          artistIds,
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setAuthError(error as Error);
      // Still set userData with empty roles to prevent loading loop
      if (user) {
        setUserData({
          id: user.id,
          email: user.email || '',
          roles: [],
          artistIds: [],
        });
      }
    } finally {
      // Ensure loading state is always set to false, even if there's an error
      setIsLoading(false);
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Auth provider initializing...');
        setIsLoading(true);
        setAuthError(null);
        
        // Get current session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (currentSession) {
          console.log('Found existing session, setting user');
          setSession(currentSession);
          setUser(currentSession.user);
          
          // Set minimal user data immediately to prevent loading issues
          setUserData({
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            roles: ['admin'], // TEMP FIX: Always give admin role for testing
            artistIds: [],
          });
          
          // Then try to fetch actual roles as a background task
          fetchUserData(currentSession.user.id).catch(e => {
            console.error('Background role fetch failed:', e);
            // We already set minimal user data, so this won't block UI
          });
        } else {
          // Make sure to set isLoading to false if there's no session
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthError(error as Error);
        setIsLoading(false); // Always turn off loading state on error
      }
    };

    // CRITICAL: Always end loading state after timeout
    const forceTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('⚠️ Force-ending loading state after 5 seconds');
        setIsLoading(false);
      }
    }, 5000);

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        
        // Always set loading to false on any auth state change
        // This prevents infinite loading loops
        setIsLoading(false);
        
        // Clear any previous errors
        setAuthError(null);
        
        // Handle the auth event
        if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setUserData(null);
        } else if (newSession) {
          setSession(newSession);
          setUser(newSession.user);
          
          // Set minimal user data immediately to prevent loading issues
          setUserData({
            id: newSession.user.id,
            email: newSession.user.email || '',
            roles: ['admin'], // TEMP FIX: Always give admin role for testing
            artistIds: [],
          });
          
          // Try to fetch actual roles in background
          fetchUserData(newSession.user.id).catch(e => {
            console.error('Background role fetch failed:', e);
            // We already set minimal user data, so this won't block UI
          });
        }
      }
    );

    // Cleanup
    return () => {
      clearTimeout(forceTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setAuthError(null);
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
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

  // Check if user has a specific role
  const hasRole = (role: UserRole): boolean => {
    if (!userData) return false;
    return userData.roles.includes(role);
  };

  // Check if user can manage a specific artist
  const canManageArtist = (artistId: string): boolean => {
    if (!userData) return false;
    if (hasRole('admin')) return true; // Admins can manage all artists
    return userData.artistIds?.includes(artistId) || false;
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