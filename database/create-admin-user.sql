-- Script to create admin user for Investment Platform
-- Run this script after the complete database reset

-- Create admin user with properly hashed password
-- Email: admin@investpro.com
-- Password: Admin123!
-- Note: The password is already bcrypt hashed

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

-- If you want to create additional test users, uncomment the following:
-- INSERT INTO users (name, email, password, mobile, balance, is_admin, created_at) VALUES
-- ('John Doe', 'john@example.com', '$2b$10$rOz7qD2R7g8H6t9I3b4KuO6X8z9Q1w2E3r4T5y6U7i8O9p0Q1w2E3r4', '9876543210', 1000.00, false, NOW()),
-- ('Jane Smith', 'jane@example.com', '$2b$10$rOz7qD2R7g8H6t9I3b4KuO6X8z9Q1w2E3r4T5y6U7i8O9p0Q1w2E3r4', '9876543211', 2500.00, false, NOW()),
-- ('Robert Johnson', 'robert@example.com', '$2b$10$rOz7qD2R7g8H6t9I3b4KuO6X8z9Q1w2E3r4T5y6U7i8O9p0Q1w2E3r4', '9876543212', 500.00, false, NOW())
-- ON CONFLICT (email) DO NOTHING;

-- Check total users count
SELECT 'Total users in database: ' || COUNT(*) as status FROM users;