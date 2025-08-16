-- Script to create admin user with plain text password for the current login implementation

-- ADMIN USER CREDENTIALS:
-- Email: admin@investpro.com
-- Password: Admin123! (stored as plain text)

-- First, let's check if the user already exists
SELECT 'Checking if admin user exists...' as status;
SELECT id, email, is_admin, password FROM users WHERE email = 'admin@investpro.com';

-- Delete the existing admin user if it exists with incorrect password
DELETE FROM users WHERE email = 'admin@investpro.com';

-- Create admin user with plain text password (as required by current login implementation)
INSERT INTO users (name, email, password, mobile, balance, is_admin, created_at)
VALUES ('Admin User', 'admin@investpro.com', 'Admin123!', '9999999999', 0, true, NOW());

-- Verify the admin user was created correctly
SELECT 'Admin user created successfully!' as status;
SELECT id, name, email, is_admin, balance, password FROM users WHERE email = 'admin@investpro.com';

-- SUCCESS MESSAGE:
-- Admin user created successfully!
-- Email: admin@investpro.com
-- Password: Admin123! (plain text)
-- You can now log in to the admin panel with these credentials.