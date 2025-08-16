-- SQL Script to Make an Existing User an Admin

-- Update existing user to admin (replace 'user@example.com' with actual email)
UPDATE users SET is_admin = true WHERE email = 'user@example.com';

-- Or make the first user an admin
UPDATE users SET is_admin = true WHERE id = (SELECT id FROM users ORDER BY created_at LIMIT 1);

-- Verify admin users
SELECT id, name, email, is_admin FROM users WHERE is_admin = true;