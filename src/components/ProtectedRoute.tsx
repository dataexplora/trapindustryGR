import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/lib/auth';
import { ReactNode, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
  artistIdParam?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  artistIdParam
}: ProtectedRouteProps) => {
  const { user, userData, isLoading, hasRole, signInWithGoogle } = useAuth();
  const location = useLocation();
  
  // Log data for debugging
  useEffect(() => {
    console.log('Protected route check:', {
      isLoading,
      user: user ? 'Authenticated' : 'Not authenticated',
      userData,
      requiredRoles,
      artistIdParam
    });
    
    if (userData?.roles) {
      console.log('User roles:', userData.roles);
    }
  }, [isLoading, user, userData, requiredRoles, artistIdParam]);

  // If auth is still loading, show a loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <p className="ml-3 text-lg text-purple-500">Checking permissions...</p>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <img 
              src="/assets/images/logo.webp" 
              alt="Urban Greece Logo" 
              className="h-16 w-auto mx-auto"
            />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-gray-800">Staff Area</h1>
          <p className="text-gray-600 mb-8">Please sign in with your staff account to continue</p>
          <Button 
            onClick={() => {
              signInWithGoogle().catch(err => {
                console.error('Sign in error:', err);
              });
            }}
            size="lg"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  // Check if the user has any of the required roles
  const hasRequiredRole = requiredRoles.length === 0 || 
    (userData?.roles && requiredRoles.some(role => userData.roles.includes(role)));
  
  console.log(`Role check result for ${requiredRoles.join(', ')}: ${hasRequiredRole ? 'PASS' : 'FAIL'}`);

  // If artist ID parameter is provided, check if the user can manage this artist
  const canManageCurrentArtist = artistIdParam 
    ? (userData?.roles?.includes('admin') || (userData?.artistIds?.includes(artistIdParam) ?? false))
    : true;

  // If the user doesn't have the required role, show access denied
  if (!hasRequiredRole || !canManageCurrentArtist) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-white">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <img 
              src="/assets/images/logo.webp" 
              alt="Urban Greece Logo" 
              className="h-16 w-auto mx-auto"
            />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h1>
          <p className="text-gray-600 mb-8">
            You don't have the required permissions to access this area.
            {requiredRoles.length > 0 && (
              <span className="block mt-2 text-sm text-gray-500">
                Required role: {requiredRoles.join(', ')}
              </span>
            )}
          </p>
          <Button 
            onClick={() => window.location.href = '/admin-check'}
            variant="outline"
            className="border-gray-300 text-gray-700"
          >
            Check Admin Status
          </Button>
        </div>
      </div>
    );
  }

  // If all checks pass, render the children
  return <>{children}</>;
};

export default ProtectedRoute; 