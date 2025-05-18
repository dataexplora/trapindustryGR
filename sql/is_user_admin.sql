-- Create or replace the is_user_admin function
CREATE OR REPLACE FUNCTION is_user_admin(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  result BOOLEAN;
BEGIN
  -- Check if the user has the admin role
  SELECT EXISTS (
    SELECT 1
    FROM user_role_assignments ra
    JOIN user_roles r ON ra.role_id = r.id
    WHERE ra.user_id = user_id_param
    AND r.role = 'admin'
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage:
-- SELECT is_user_admin('YOUR-USER-ID-HERE'); 