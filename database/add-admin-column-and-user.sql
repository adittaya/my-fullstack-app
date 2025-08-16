-- SQL Script to Add Admin Column and Create Admin User for Investment Platform

-- Add is_admin column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add updated_at column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Create unique index for users email
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_email ON users(email);

-- Create admin user
INSERT INTO users (name, email, password, mobile, balance, is_admin, created_at)
VALUES ('Admin User', 'admin@investpro.com', 'Admin123!', '9999999999', 0, true, NOW())
ON CONFLICT (email) DO UPDATE SET is_admin = true;

-- Verify the admin user was created
SELECT id, name, email, is_admin FROM users WHERE email = 'admin@investpro.com';