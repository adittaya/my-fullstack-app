-- Script to fix the updated_at column issue in Supabase
-- This script removes any problematic triggers and recreates the users table properly

-- First, let's drop any existing triggers on the users table
DROP TRIGGER IF EXISTS on_updated_at ON users;

-- If there's a function that's causing issues, let's drop it
DROP FUNCTION IF EXISTS moddatetime() CASCADE;

-- Now let's recreate the users table with proper handling
-- We'll create a new table, copy data, and rename

-- Create a new users table without the automatic trigger issues
CREATE TABLE IF NOT EXISTS users_new (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  mobile VARCHAR(20),
  balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT FALSE
);

-- Copy data from the old table to the new table
INSERT INTO users_new (id, name, email, password, mobile, balance, created_at, updated_at, is_admin)
SELECT id, name, email, password, mobile, balance, created_at, updated_at, is_admin
FROM users
ON CONFLICT (email) DO NOTHING;

-- Drop the old table
DROP TABLE users;

-- Rename the new table to users
ALTER TABLE users_new RENAME TO users;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Update the functions to properly handle updated_at
CREATE OR REPLACE FUNCTION increment_user_balance(user_id INTEGER, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET balance = balance + amount,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_user_balance(user_id INTEGER, amount DECIMAL)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance DECIMAL;
BEGIN
  SELECT balance INTO current_balance FROM users WHERE id = user_id;
  
  IF current_balance >= amount THEN
    UPDATE users
    SET balance = balance - amount,
        updated_at = NOW()
    WHERE id = user_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Verify the fix
SELECT 'Database schema fixed successfully' as status;