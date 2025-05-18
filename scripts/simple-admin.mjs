#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Explicitly load .env from the root directory
config({ path: resolve(rootDir, '.env') });

// Log to debug
console.log('Environment loaded from:', resolve(rootDir, '.env'));
console.log('File exists:', fs.existsSync(resolve(rootDir, '.env')));
console.log('Current directory:', process.cwd());
console.log('Script directory:', __dirname);

// Get user email from command line
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('Please provide a user email: node scripts/simple-admin.mjs your-email@gmail.com');
  process.exit(1);
}

// Read variables directly from .env
const envContent = fs.readFileSync(resolve(rootDir, '.env'), 'utf8');
console.log('Environment file content preview (first 50 chars):', envContent.substring(0, 50));

// Get Supabase credentials - Use VITE prefixed variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'Found' : 'Not found');
console.log('VITE_SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'Found' : 'Not found');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please make sure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_KEY are correctly set in your .env file');
  process.exit(1);
}

// Create Supabase client with admin rights
const supabase = createClient(
  supabaseUrl, 
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Simple function to make user admin
async function makeUserAdmin(email) {
  try {
    console.log(`Looking up user with email: ${email}`);
    
    // Find the user by email - use auth.admin functions only available with service role key
    let userData;
    
    try {
      // Try newer API first
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      
      const users = data.users || [];
      const user = users.find(u => u.email === email);
      
      if (!user) {
        console.error(`User with email ${email} not found in Supabase auth system`);
        process.exit(1);
      }
      
      userData = user;
      console.log('Found user using listUsers method');
    } catch (authError) {
      console.log('Error using listUsers method, trying alternative:', authError.message);
      
      // Try alternative method - direct query to auth.users table
      const { data: users, error: usersError } = await supabase
        .from('auth.users')
        .select('*')
        .eq('email', email)
        .limit(1);
      
      if (usersError || !users || users.length === 0) {
        // Last resort - try user lookup via normal auth
        const { data: authData, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authData?.user) {
          console.error('Could not find user via any method:', authError?.message);
          process.exit(1);
        }
        
        if (authData.user.email !== email) {
          console.error(`Currently logged in user (${authData.user.email}) does not match requested user (${email})`);
          process.exit(1);
        }
        
        userData = authData.user;
      } else {
        userData = users[0];
      }
    }
    
    // We should have the user by now
    console.log(`Found user: ${userData.email} (ID: ${userData.id})`);
    
    // Get admin role
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'admin');
    
    if (rolesError || !roles || roles.length === 0) {
      console.error('Admin role not found - creating roles...');
      
      await supabase
        .from('user_roles')
        .insert([
          { role: 'admin', description: 'Administrator with full access' },
          { role: 'artist', description: 'Artist with limited access' }
        ]);
      
      console.log('Roles created successfully');
      
      // Fetch newly created roles
      const { data: newRoles } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'admin');
        
      if (!newRoles || newRoles.length === 0) {
        console.error('Failed to create roles');
        process.exit(1);
      }
      
      // Assign admin role
      const { error: assignError } = await supabase
        .from('user_role_assignments')
        .insert([
          { user_id: userData.id, role_id: newRoles[0].id }
        ]);
      
      if (assignError) {
        console.error('Error assigning role:', assignError.message);
        process.exit(1);
      }
      
      console.log(`Success! User ${email} is now an admin`);
    } else {
      // Check if role is already assigned
      const { data: existing } = await supabase
        .from('user_role_assignments')
        .select('*')
        .eq('user_id', userData.id)
        .eq('role_id', roles[0].id);
      
      if (existing && existing.length > 0) {
        console.log(`User ${email} is already an admin`);
        process.exit(0);
      }
      
      // Assign admin role
      const { error: assignError } = await supabase
        .from('user_role_assignments')
        .insert([
          { user_id: userData.id, role_id: roles[0].id }
        ]);
      
      if (assignError) {
        console.error('Error assigning role:', assignError.message);
        process.exit(1);
      }
      
      console.log(`Success! User ${email} is now an admin`);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

makeUserAdmin(userEmail); 