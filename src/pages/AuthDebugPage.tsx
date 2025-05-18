import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export default function AuthDebugPage() {
  const { user, userData, isLoading, resetAuthState } = useAuth();
  const [debugResult, setDebugResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if user has admin role directly from database
  const checkAdminRole = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!user) {
        setError('No user logged in');
        return;
      }
      
      // 1. Get admin role ID
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'admin');
        
      if (rolesError) throw rolesError;
      if (!roles || roles.length === 0) {
        setError('Admin role not found in database');
        return;
      }
      
      const adminRoleId = roles[0].id;
      
      // 2. Check if user has admin role
      const { data, error } = await supabase
        .from('user_role_assignments')
        .select('*')
        .eq('user_id', user.id)
        .eq('role_id', adminRoleId);
        
      if (error) throw error;
      
      const hasAdminRole = data && data.length > 0;
      
      setDebugResult({
        adminRoleId,
        assignments: data,
        hasAdminRole,
        userId: user.id,
        email: user.email,
      });
      
      setSuccess(`Database check complete: User ${hasAdminRole ? 'HAS' : 'DOES NOT HAVE'} admin role`);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      console.error('Debug error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Force assign admin role to current user
  const assignAdminRole = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!user) {
        setError('No user logged in');
        return;
      }
      
      // 1. Get admin role ID
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'admin');
        
      if (rolesError) throw rolesError;
      if (!roles || roles.length === 0) {
        // Try to create admin role
        const { data: newRole, error: createError } = await supabase
          .from('user_roles')
          .insert([{ role: 'admin', description: 'Administrator with full access' }])
          .select();
          
        if (createError) throw createError;
        if (!newRole || newRole.length === 0) {
          setError('Failed to create admin role');
          return;
        }
        
        const adminRoleId = newRole[0].id;
        
        // Assign role to user
        const { error: assignError } = await supabase
          .from('user_role_assignments')
          .insert([{ user_id: user.id, role_id: adminRoleId }]);
          
        if (assignError) throw assignError;
        
        setSuccess(`Created admin role and assigned it to ${user.email}`);
        return;
      }
      
      const adminRoleId = roles[0].id;
      
      // Check if assignment already exists
      const { data: existing, error: checkError } = await supabase
        .from('user_role_assignments')
        .select('*')
        .eq('user_id', user.id)
        .eq('role_id', adminRoleId);
        
      if (checkError) throw checkError;
      
      if (existing && existing.length > 0) {
        setSuccess(`User ${user.email} already has admin role`);
        return;
      }
      
      // Create assignment
      const { error: assignError } = await supabase
        .from('user_role_assignments')
        .insert([{ user_id: user.id, role_id: adminRoleId }]);
        
      if (assignError) throw assignError;
      
      setSuccess(`Successfully assigned admin role to ${user.email}`);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      console.error('Assignment error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-4 bg-green-50 border-green-500">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6 p-6 border rounded-lg mb-6">
        <h2 className="text-lg font-semibold">Current Auth State</h2>
        <div className="grid gap-2">
          <div><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
          <div><strong>User:</strong> {user ? user.email : 'Not logged in'}</div>
          <div><strong>User ID:</strong> {user?.id || 'N/A'}</div>
          <div><strong>Roles:</strong> {userData?.roles?.join(', ') || 'None'}</div>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={resetAuthState} variant="destructive">
            Emergency Reset
          </Button>
          <Button onClick={checkAdminRole} disabled={loading}>
            Check Admin Role
          </Button>
          <Button onClick={assignAdminRole} disabled={loading} variant="outline">
            Force Assign Admin Role
          </Button>
        </div>
      </div>
      
      {debugResult && (
        <div className="border rounded-lg p-4 mt-4 bg-gray-50">
          <h3 className="font-semibold mb-2 flex justify-between">
            Database Check Results
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setDebugResult(null)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </h3>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-x-auto">
            {JSON.stringify(debugResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 