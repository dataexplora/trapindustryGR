import { useEffect, useState } from 'react';
import { supabase, checkSupabaseConnection } from '@/lib/supabase';

// Properly typed interfaces for the DB structure
interface Role {
  id: string;
  role: string;
}

interface UserRoleAssignment {
  role_id: string;
  user_roles: Role;
}

export default function AdminCheck() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<'unknown'|'connected'|'error'>('unknown');
  const [pingResults, setPingResults] = useState<any[]>([]);

  // Perform basic connectivity check on load
  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        setLoading(true);
        
        // Get basic env variables
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        
        // Test if we can connect to Supabase
        console.log('Testing Supabase connection...');
        setDetails({
          env: {
            supabaseUrl: supabaseUrl || 'Not set',
            nodeEnv: import.meta.env.MODE,
            isDev: import.meta.env.DEV,
          }
        });
        
        // Try to get current user
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        
        // Try to ping database directly with basic query
        const pingResult = await pingDatabase();
        setConnectionStatus(pingResult.success ? 'connected' : 'error');
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred');
        console.error('Connectivity check error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkConnectivity();
  }, []);
  
  // Basic database ping test function
  const pingDatabase = async () => {
    try {
      const startTime = Date.now();
      const { data, error } = await supabase.from('user_roles').select('count');
      const endTime = Date.now();
      
      const result = {
        timestamp: new Date().toISOString(),
        success: !error,
        latency: endTime - startTime,
        error: error ? error.message : null,
        data
      };
      
      setPingResults(prev => [result, ...prev].slice(0, 10));
      return result;
    } catch (err: any) {
      const result = {
        timestamp: new Date().toISOString(),
        success: false,
        latency: 0,
        error: err.message,
        data: null
      };
      
      setPingResults(prev => [result, ...prev].slice(0, 10));
      return result;
    }
  };
  
  // Test admin role assignment directly
  const checkAdminRole = async () => {
    if (!user) {
      setError('User not logged in');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // 1. Get admin role
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'admin')
        .maybeSingle();
        
      if (rolesError) throw rolesError;
      
      const adminRoleId = roles?.id;
      
      if (!adminRoleId) {
        setError('Admin role not found in database');
        setIsAdmin(false);
        return;
      }
      
      setDetails(prev => ({
        ...prev,
        adminCheck: {
          step: 'Found admin role',
          roleId: adminRoleId
        }
      }));
      
      // 2. Check if user has this role
      const { data: assignments, error: assignmentsError } = await supabase
        .from('user_role_assignments')
        .select('*')
        .eq('user_id', user.id)
        .eq('role_id', adminRoleId);
        
      if (assignmentsError) throw assignmentsError;
      
      const hasAdminRole = assignments && assignments.length > 0;
      setIsAdmin(hasAdminRole);
      
      setDetails(prev => ({
        ...prev,
        adminCheck: {
          ...prev?.adminCheck,
          step: 'Completed role check',
          hasRole: hasAdminRole,
          assignments
        }
      }));
      
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Grant admin role to current user
  const makeAdmin = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get admin role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'admin')
        .maybeSingle();
        
      if (!roles || !roles.id) {
        // Create admin role
        const { data: newRole, error: createError } = await supabase
          .from('user_roles')
          .insert([{ role: 'admin', description: 'Administrator role' }])
          .select();
          
        if (createError) throw createError;
        
        // Assign role to user
        const { error: assignError } = await supabase
          .from('user_role_assignments')
          .insert([{ user_id: user.id, role_id: newRole[0].id }]);
        
        if (assignError) throw assignError;
        
        setIsAdmin(true);
        setDetails(prev => ({
          ...prev,
          adminAssignment: {
            roleId: newRole[0].id,
            status: 'Created and assigned'
          }
        }));
      } else {
        // Assign existing role
        const { error: assignError } = await supabase
          .from('user_role_assignments')
          .insert([{ user_id: user.id, role_id: roles.id }]);
        
        if (assignError) throw assignError;
        
        setIsAdmin(true);
        setDetails(prev => ({
          ...prev,
          adminAssignment: {
            roleId: roles.id,
            status: 'Assigned existing role'
          }
        }));
      }
      
      // Force reload current page after success
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '40px auto',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Authentication & Database Diagnostics</h1>
      
      {loading ? (
        <p>Running diagnostics...</p>
      ) : error ? (
        <div style={{ 
          padding: '15px', 
          border: '1px solid #f56565', 
          borderRadius: '5px',
          backgroundColor: '#fff5f5',
          color: '#c53030',
          marginBottom: '20px'
        }}>
          <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Error:</p>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div style={{ 
            padding: '15px', 
            border: '1px solid #e2e8f0', 
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Connection Status</h2>
            <p>
              <strong>Status:</strong>{' '}
              {connectionStatus === 'connected' ? (
                <span style={{ color: 'green' }}>✅ Connected</span>
              ) : connectionStatus === 'error' ? (
                <span style={{ color: 'red' }}>❌ Connection Error</span>
              ) : (
                <span style={{ color: 'orange' }}>⚠️ Unknown</span>
              )}
            </p>
            {user ? (
              <>
                <p><strong>User:</strong> {user.email}</p>
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Admin Status:</strong> {
                  isAdmin === null ? 'Unknown' : 
                  isAdmin ? '✅ Is Admin' : '❌ Not Admin'
                }</p>
              </>
            ) : (
              <p style={{ color: 'red' }}>Not logged in</p>
            )}
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Database Connection Tests</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button
                onClick={pingDatabase}
                disabled={loading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Ping Database
              </button>
              
              <button
                onClick={checkAdminRole}
                disabled={loading || !user}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Check Admin Role
              </button>
              
              {user && isAdmin === false && (
                <button
                  onClick={makeAdmin}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Make Admin
                </button>
              )}
            </div>
            
            {pingResults.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Ping Results</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Time</th>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Latency</th>
                      <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pingResults.map((result, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px' }}>{new Date(result.timestamp).toLocaleTimeString()}</td>
                        <td style={{ padding: '8px' }}>
                          {result.success ? (
                            <span style={{ color: 'green' }}>✅ Success</span>
                          ) : (
                            <span style={{ color: 'red' }}>❌ Failed</span>
                          )}
                        </td>
                        <td style={{ padding: '8px' }}>{result.latency}ms</td>
                        <td style={{ padding: '8px', color: 'red' }}>{result.error || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {details && (
            <div>
              <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Environment & Debug Info</h2>
              <pre style={{
                padding: '15px',
                backgroundColor: '#f1f5f9',
                borderRadius: '5px',
                overflow: 'auto',
                fontSize: '14px'
              }}>
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}
          
          <div style={{ marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>
              If you're experiencing connectivity issues:
            </p>
            <ul style={{ fontSize: '14px', color: '#64748b', paddingLeft: '20px' }}>
              <li>Check your internet connection</li>
              <li>Try disabling VPNs or proxies</li>
              <li>Ensure your network allows connections to Supabase</li>
              <li>Try using a different network</li>
            </ul>
          </div>
        </>
      )}
      
      <div style={{ marginTop: '30px' }}>
        <a 
          href="/"
          style={{
            color: '#4f46e5',
            textDecoration: 'none'
          }}
        >
          &larr; Back to Home
        </a>
      </div>
    </div>
  );
} 