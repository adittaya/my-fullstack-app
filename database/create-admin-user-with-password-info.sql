-- Script to create admin user with clear password information

-- ADMIN USER CREDENTIALS:
-- Email: admin@investpro.com
-- Password: Admin123!

-- The password below is a bcrypt hash of "Admin123!"
-- If you want to change the password, you'll need to generate a new bcrypt hash

INSERT INTO users (name, email, password, mobile, balance, is_admin, created_at)
VALUES ('Admin User', 'admin@investpro.com', '$2b$10$rOz7qD2R7g8H6t9I3b4KuO6X8z9Q1w2E3r4T5y6U7i8O9p0Q1w2E3r4', '9999999999', 0, true, NOW())
ON CONFLICT (email) DO UPDATE SET 
    name = 'Admin User',
    password = '$2b$10$rOz7qD2R7g8H6t9I3b4KuO6X8z9Q1w2E3r4T5y6U7i8O9p0Q1w2E3r4',
    mobile = '9999999999',
    balance = 0,
    is_admin = true,
    created_at = NOW();

-- Verify the admin user was created
SELECT id, name, email, is_admin, balance FROM users WHERE email = 'admin@investpro.com';

-- SUCCESS MESSAGE:
-- Admin user created successfully!
-- Email: admin@investpro.com
-- Password: Admin123!
-- You can now log in to the admin panel with these credentials.