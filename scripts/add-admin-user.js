#!/usr/bin/env node
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error(
    'Missing required environment variables. Please make sure SUPABASE_URL and SUPABASE_SERVICE_KEY are set.'
  );
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get user email from command line
const userEmail = process.argv[2];

if (!userEmail) {
  console.error('Please provide a user email: node add-admin-user.js user@example.com');
  process.exit(1);
}

async function makeUserAdmin(email) {
  try {
    // 1. Get the user from Supabase Auth
    console.log(`Looking up user with email: ${email}`);
    const { data: user, error: userError } = await supabase
      .auth
      .admin
      .getUserByEmail(email);

    if (userError || !user) {
      console.error(`Error finding user: ${userError?.message || 'User not found'}`);
      process.exit(1);
    }

    console.log(`Found user with ID: ${user.id}`);

    // 2. Get the admin role ID from the user_roles table
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.error(`Error finding admin role: ${roleError?.message || 'Role not found'}`);
      process.exit(1);
    }

    const adminRoleId = roleData.id;
    console.log(`Found admin role with ID: ${adminRoleId}`);

    // 3. Check if user already has the admin role
    const { data: existingRole, error: existingRoleError } = await supabase
      .from('user_role_assignments')
      .select('*')
      .eq('user_id', user.id)
      .eq('role_id', adminRoleId);

    if (existingRole && existingRole.length > 0) {
      console.log(`User ${email} is already an admin.`);
      process.exit(0);
    }

    // 4. Assign admin role to the user
    const { data: assignment, error: assignmentError } = await supabase
      .from('user_role_assignments')
      .insert([
        { user_id: user.id, role_id: adminRoleId }
      ]);

    if (assignmentError) {
      console.error(`Error assigning admin role: ${assignmentError.message}`);
      process.exit(1);
    }

    console.log(`✅ Successfully made ${email} an admin!`);

  } catch (error) {
    console.error('Unexpected error:', error.message);
    process.exit(1);
  }
}

makeUserAdmin(userEmail); 