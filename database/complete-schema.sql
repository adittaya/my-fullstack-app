-- Complete Database Schema for Investment Platform
-- This script includes all tables, indexes, functions, sample data, and admin user setup

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  mobile VARCHAR(20),
  balance DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add is_admin column to users table (for existing databases)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Create product_plans table
CREATE TABLE IF NOT EXISTS product_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  daily_income DECIMAL(10, 2) NOT NULL,
  total_return DECIMAL(10, 2) NOT NULL,
  duration_days INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
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
CREATE TABLE IF NOT EXISTS withdrawals (
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
CREATE TABLE IF NOT EXISTS recharges (
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
CREATE TABLE IF NOT EXISTS balance_adjustments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  reason TEXT NOT NULL,
  admin_id INTEGER REFERENCES users(id),
  adjustment_date TIMESTAMP DEFAULT NOW()
);

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
('Royal Investor', 5000.00, 250.00, 7500.00, 30)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_recharges_user_id ON recharges(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_purchase_date ON investments(purchase_date);
CREATE INDEX IF NOT EXISTS idx_withdrawals_request_date ON withdrawals(request_date);
CREATE INDEX IF NOT EXISTS idx_recharges_request_date ON recharges(request_date);

-- Create function to increment user balance
CREATE OR REPLACE FUNCTION increment_user_balance(user_id INTEGER, amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET balance = balance + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to decrement user balance
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

-- Create admin user
INSERT INTO users (name, email, password, mobile, balance, is_admin, created_at)
VALUES ('Admin User', 'admin@investpro.com', 'Admin123!', '9999999999', 0, true, NOW())
ON CONFLICT (email) DO UPDATE SET is_admin = true;

-- Verify the admin user was created
SELECT id, name, email, is_admin FROM users WHERE email = 'admin@investpro.com';