-- User roles for permissions management
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  role VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial roles
INSERT INTO user_roles (role, description) 
VALUES 
  ('admin', 'Administrator with full access to all features'),
  ('artist', 'Artist who can manage their own events only');

-- Junction table to assign roles to users
-- Supabase already has an auth.users table by default
CREATE TABLE user_role_assignments (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES user_roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, role_id)
);

-- Table to link artists to specific user accounts
CREATE TABLE artist_users (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id VARCHAR(50) REFERENCES artists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, artist_id)
);

-- Function to check if a user has a specific role
CREATE OR REPLACE FUNCTION user_has_role(user_uuid UUID, role_name VARCHAR) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_role_assignments ura
    JOIN user_roles ur ON ura.role_id = ur.id
    WHERE ura.user_id = user_uuid AND ur.role = role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security (RLS) policy for events based on user role/artist
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy for admin users who can access all events
CREATE POLICY "Admins can access all events" 
ON events
FOR ALL
TO authenticated
USING (
  (SELECT user_has_role(auth.uid(), 'admin'))
);

-- Policy for artists who can access only their own events
CREATE POLICY "Artists can access their own events" 
ON events
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM artist_users au
    JOIN artist_events ae ON au.artist_id = ae.artist_id
    WHERE au.user_id = auth.uid() AND ae.event_id = events.id
  )
); 