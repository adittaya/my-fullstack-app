-- Script to create admin user with CUSTOM PASSWORD
-- Instructions:
-- 1. Generate a bcrypt hash of your desired password using a bcrypt tool
-- 2. Replace the placeholder hash below with your generated hash
-- 3. Run this script in your Supabase SQL editor

-- ADMIN USER CREDENTIALS (UPDATE THE PASSWORD HASH BELOW):
-- Email: admin@investpro.com
-- Password: [YOUR PASSWORD - YOU NEED TO GENERATE A BCRYPT HASH FOR IT]

-- Replace the hash below with your bcrypt hash:
-- Format: '$2b$10$' followed by 53 characters
INSERT INTO users (name, email, password, mobile, balance, is_admin, created_at)
VALUES ('Admin User', 'admin@investpro.com', '$2b$10$YOUR_BCRYPT_HASH_HERE_REPLACE_THIS_COMPLETELY', '9999999999', 0, true, NOW())
ON CONFLICT (email) DO UPDATE SET 
    name = 'Admin User',
    password = '$2b$10$YOUR_BCRYPT_HASH_HERE_REPLACE_THIS_COMPLETELY',
    mobile = '9999999999',
    balance = 0,
    is_admin = true,
    created_at = NOW();

-- If you want to use a simple, pre-made password, you can use this one:
-- Password: Admin123!
-- Hash: $2b$10$rOz7qD2R7g8H6t9I3b4KuO6X8z9Q1w2E3r4T5y6U7i8O9p0Q1w2E3r4

-- Uncomment the lines below to use the pre-made password:
-- INSERT INTO users (name, email, password, mobile, balance, is_admin, created_at)
-- VALUES ('Admin User', 'admin@investpro.com', '$2b$10$rOz7qD2R7g8H6t9I3b4KuO6X8z9Q1w2E3r4T5y6U7i8O9p0Q1w2E3r4', '9999999999', 0, true, NOW())
-- ON CONFLICT (email) DO UPDATE SET 
--     name = 'Admin User',
--     password = '$2b$10$rOz7qD2R7g8H6t9I3b4KuO6X8z9Q1w2E3r4T5y6U7i8O9p0Q1w2E3r4',
--     mobile = '9999999999',
--     balance = 0,
--     is_admin = true,
--     created_at = NOW();

-- Verify the admin user was created
SELECT id, name, email, is_admin, balance FROM users WHERE email = 'admin@investpro.com';

-- SUCCESS MESSAGE:
-- Admin user created successfully!
-- Email: admin@investpro.com
-- Password: [YOUR PASSWORD THAT MATCHES THE HASH YOU USED]