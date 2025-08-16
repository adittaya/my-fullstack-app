-- COMPLETE CLEAN SCRIPT FOR INVESTMENT PLATFORM DATABASE
-- This script will DROP ALL existing tables and recreate them from scratch
-- WARNING: This will DELETE ALL DATA in the database

-- Drop any triggers first (before dropping tables)
DROP TRIGGER IF EXISTS on_updated_at ON users;

-- Drop all tables in correct order (due to foreign key constraints)
DROP TABLE IF EXISTS balance_adjustments CASCADE;
DROP TABLE IF EXISTS recharges CASCADE;
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS product_plans CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop any problematic functions
DROP FUNCTION IF EXISTS moddatetime() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS increment_user_balance(integer, numeric) CASCADE;
DROP FUNCTION IF EXISTS decrement_user_balance(integer, numeric) CASCADE;

-- Now recreate everything from scratch using the clean schema
-- Create users table WITHOUT updated_at column
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  mobile VARCHAR(20),
  balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT FALSE
);

-- Create product_plans table
CREATE TABLE product_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  daily_income DECIMAL(10, 2) NOT NULL,
  total_return DECIMAL(10, 2) NOT NULL,
  duration_days INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create investments table
CREATE TABLE investments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  plan_id INTEGER,
  plan_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  purchase_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create withdrawals table
CREATE TABLE withdrawals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  gst_amount DECIMAL(10, 2) NOT NULL,
  net_amount DECIMAL(10, 2) NOT NULL,
  method VARCHAR(50) NOT NULL, -- 'bank' or 'upi'
  details TEXT NOT NULL,
  request_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  processed_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create recharges table
CREATE TABLE recharges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  utr VARCHAR(255) NOT NULL,
  request_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  processed_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create balance_adjustments table for admin actions
CREATE TABLE balance_adjustments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT NOT NULL,
  admin_id INTEGER REFERENCES users(id),
  adjustment_date TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_recharges_user_id ON recharges(user_id);
CREATE INDEX idx_investments_purchase_date ON investments(purchase_date);
CREATE INDEX idx_withdrawals_request_date ON withdrawals(request_date);
CREATE INDEX idx_recharges_request_date ON recharges(request_date);

-- Create function to increment user balance (without updated_at)
CREATE OR REPLACE FUNCTION increment_user_balance(user_id INTEGER, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET balance = balance + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to decrement user balance (without updated_at)
CREATE OR REPLACE FUNCTION decrement_user_balance(user_id INTEGER, amount DECIMAL)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance DECIMAL;
BEGIN
  SELECT balance INTO current_balance FROM users WHERE id = user_id;
  
  IF current_balance >= amount THEN
    UPDATE users
    SET balance = balance - amount
    WHERE id = user_id;
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert sample product plans
INSERT INTO product_plans (name, price, daily_income, total_return, duration_days) VALUES
('Starter Plan', 490.00, 80.00, 720.00, 9),
('Smart Saver', 750.00, 85.00, 1190.00, 14),
('Bronze Booster', 1000.00, 100.00, 1500.00, 15),
('Silver Growth', 1500.00, 115.00, 2300.00, 20),
('Gold Income', 2000.00, 135.00, 3105.00, 23),
('Platinum Plan', 2500.00, 160.00, 3840.00, 24),
('Elite Earning', 3000.00, 180.00, 4500.00, 25),
('VIP Profiter', 3500.00, 200.00, 5400.00, 27),
('Executive Growth', 4000.00, 220.00, 6160.00, 28),
('Royal Investor', 5000.00, 250.00, 7500.00, 30);

-- Create admin user FIRST
INSERT INTO users (name, email, password, mobile, balance, is_admin, created_at)
VALUES ('Admin User', 'admin@investpro.com', '$2b$10$rOz7qD2R7g8H6t9I3b4KuO6X8z9Q1w2E3r4T5y6U7i8O9p0Q1w2E3r4', '9999999999', 0, true, NOW());

-- Create a few sample users for testing
INSERT INTO users (name, email, password, mobile, balance, is_admin, created_at) VALUES
('John Doe', 'john@example.com', '$2b$10$rOz7qD2R7g8H6t9I3b4KuO6X8z9Q1w2E3r4T5y6U7i8O9p0Q1w2E3r4', '9876543210', 1000.00, false, NOW()),
('Jane Smith', 'jane@example.com', '$2b$10$rOz7qD2R7g8H6t9I3b4KuO6X8z9Q1w2E3r4T5y6U7i8O9p0Q1w2E3r4', '9876543211', 2500.00, false, NOW()),
('Robert Johnson', 'robert@example.com', '$2b$10$rOz7qD2R7g8H6t9I3b4KuO6X8z9Q1w2E3r4T5y6U7i8O9p0Q1w2E3r4', '9876543212', 500.00, false, NOW());

-- Create sample investments (using actual user IDs)
DO $$
DECLARE
  user1_id INTEGER;
  user2_id INTEGER;
  user3_id INTEGER;
  plan1_id INTEGER;
  plan3_id INTEGER;
  plan5_id INTEGER;
  plan2_id INTEGER;
BEGIN
  -- Get user IDs
  SELECT id INTO user1_id FROM users WHERE email = 'admin@investpro.com';
  SELECT id INTO user2_id FROM users WHERE email = 'john@example.com';
  SELECT id INTO user3_id FROM users WHERE email = 'jane@example.com';
  
  -- Get plan IDs
  SELECT id INTO plan1_id FROM product_plans WHERE name = 'Starter Plan';
  SELECT id INTO plan3_id FROM product_plans WHERE name = 'Bronze Booster';
  SELECT id INTO plan5_id FROM product_plans WHERE name = 'Gold Income';
  SELECT id INTO plan2_id FROM product_plans WHERE name = 'Smart Saver';
  
  -- Create sample investments
  INSERT INTO investments (user_id, plan_id, plan_name, amount, purchase_date, status) VALUES
  (user2_id, plan1_id, 'Starter Plan', 490.00, NOW() - INTERVAL '2 days', 'active'),
  (user2_id, plan3_id, 'Bronze Booster', 1000.00, NOW() - INTERVAL '5 days', 'active'),
  (user3_id, plan5_id, 'Gold Income', 2000.00, NOW() - INTERVAL '1 day', 'active'),
  (user1_id, plan2_id, 'Smart Saver', 750.00, NOW() - INTERVAL '3 days', 'active');
END $$;

-- Create sample pending recharges (using actual user IDs)
DO $$
DECLARE
  user1_id INTEGER;
  user2_id INTEGER;
BEGIN
  -- Get user IDs
  SELECT id INTO user1_id FROM users WHERE email = 'admin@investpro.com';
  SELECT id INTO user2_id FROM users WHERE email = 'john@example.com';
  
  -- Create sample pending recharges
  INSERT INTO recharges (user_id, amount, utr, request_date, status) VALUES
  (user1_id, 1000.00, 'UTR123456789', NOW() - INTERVAL '1 hour', 'pending'),
  (user2_id, 2000.00, 'UTR987654321', NOW() - INTERVAL '2 hours', 'pending');
END $$;

-- Create sample pending withdrawals (using actual user IDs)
DO $$
DECLARE
  user1_id INTEGER;
  user3_id INTEGER;
BEGIN
  -- Get user IDs
  SELECT id INTO user1_id FROM users WHERE email = 'admin@investpro.com';
  SELECT id INTO user3_id FROM users WHERE email = 'jane@example.com';
  
  -- Create sample pending withdrawals
  INSERT INTO withdrawals (user_id, amount, gst_amount, net_amount, method, details, request_date, status) VALUES
  (user1_id, 500.00, 90.00, 410.00, 'bank', 'Account: 123456789, IFSC: ABCD1234567', NOW() - INTERVAL '30 minutes', 'pending'),
  (user3_id, 300.00, 54.00, 246.00, 'upi', 'UPI ID: user@upi', NOW() - INTERVAL '45 minutes', 'pending');
END $$;

-- Verify everything was created
SELECT 'Database reset and recreated successfully' as status;
SELECT 'Admin user created with email: admin@investpro.com' as status;