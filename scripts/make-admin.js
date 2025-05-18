#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import process from 'process';

// Setup dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config();

// Initialize Supabase admin client
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get user email from command line
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('Please provide a user email: node scripts/make-admin.js user@example.com');
  process.exit(1);
}

async function makeUserAdmin(email) {
  try {
    console.log(`Looking up user with email: ${email}`);
    
    // Step 1: Find the user by email in auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (userError || !userData) {
      console.error(`Error finding user: ${userError?.message || 'User not found'}`);
      process.exit(1);
    }
    
    const user = userData.user;
    console.log(`Found user with ID: ${user.id}`);
    
    // Step 2: Find admin role ID from user_roles table
    let { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('role', 'admin');
    
    if (rolesError || !roles || roles.length === 0) {
      console.error(`Error finding admin role: ${rolesError?.message || 'Role not found'}`);
      
      // Create roles if they don't exist
      console.log('Trying to create roles...');
      await supabase
        .from('user_roles')
        .insert([
          { role: 'admin', description: 'Administrator with full access to all features' },
          { role: 'artist', description: 'Artist who can manage their own events only' }
        ]);
      
      console.log('Roles created, trying again...');
      
      const { data: newRoles, error: newRolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('role', 'admin');
      
      if (newRolesError || !newRoles || newRoles.length === 0) {
        console.error('Failed to create roles:', newRolesError?.message);
        process.exit(1);
      }
      
      roles = newRoles;
    }
    
    const adminRole = roles[0];
    console.log(`Found admin role with ID: ${adminRole.id}`);
    
    // Step 3: Check if user is already an admin
    const { data: existingAssignment, error: existingError } = await supabase
      .from('user_role_assignments')
      .select('*')
      .eq('user_id', user.id)
      .eq('role_id', adminRole.id);
    
    if (existingAssignment && existingAssignment.length > 0) {
      console.log(`User ${email} is already an admin`);
      process.exit(0);
    }
    
    // Step 4: Assign admin role to the user
    const { data: assignment, error: assignmentError } = await supabase
      .from('user_role_assignments')
      .insert([
        { user_id: user.id, role_id: adminRole.id }
      ]);
    
    if (assignmentError) {
      console.error(`Error assigning admin role: ${assignmentError.message}`);
      process.exit(1);
    }
    
    console.log(`✅ Successfully made ${email} an admin!`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

makeUserAdmin(userEmail); 