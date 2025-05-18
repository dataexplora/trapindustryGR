import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if we have a session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session) {
          setError('No session found after authentication');
          return;
        }
        
        console.log('Auth callback - session established for:', session.user.email);
        
        // Manually verify admin role
        try {
          console.log('Verifying admin role after authentication');
          const { data: roles } = await supabase
            .from('user_roles')
            .select('*')
            .eq('role', 'admin');
            
          if (!roles || roles.length === 0) {
            console.error('No admin role found in database during callback');
          } else {
            const adminRoleId = roles[0].id;
            
            // Check if this user has admin role
            const { data: userRoles } = await supabase
              .from('user_role_assignments')
              .select('*')
              .eq('user_id', session.user.id)
              .eq('role_id', adminRoleId);
              
            const isAdmin = userRoles && userRoles.length > 0;
            console.log(`Post-authentication admin check: User is ${isAdmin ? 'ADMIN' : 'NOT ADMIN'}`);
            
            // If user isn't admin but should be, consider adding a "force assign" option
          }
        } catch (verifyError) {
          console.error('Error during post-auth admin verification:', verifyError);
          // Continue with redirect despite verification error
        }
        
        // Get the original page the user was trying to access
        const savedPath = localStorage.getItem('auth_redirect_path');
        const redirectPath = savedPath || '/';
        
        // Clear the saved path
        localStorage.removeItem('auth_redirect_path');
        
        // Apply small delay to ensure auth state is fully propagated
        setTimeout(() => {
          setRedirectTo(redirectPath);
        }, 500);
        
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication error');
      }
    };
    
    handleAuthCallback();
  }, []);

  if (error) {
    return (
      <div style={{ 
        maxWidth: '500px', 
        margin: '100px auto', 
        padding: '20px', 
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Authentication Error</h1>
        <p style={{ color: '#e53e3e', marginBottom: '20px' }}>{error}</p>
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '10px 16px',
            backgroundColor: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '100px auto', 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif' 
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Completing Sign In</h1>
      <div style={{ 
        display: 'inline-block',
        width: '30px',
        height: '30px',
        border: '3px solid rgba(79, 70, 229, 0.3)',
        borderRadius: '50%',
        borderTopColor: '#4F46E5',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 