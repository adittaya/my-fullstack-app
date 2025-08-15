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
  plan_id INTEGER REFERENCES product_plans(id),
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
('Basic Plan', 500.00, 50.00, 1500.00, 30),
('Silver Plan', 1000.00, 120.00, 3600.00, 30),
('Gold Plan', 5000.00, 650.00, 19500.00, 30),
('Platinum Plan', 10000.00, 1400.00, 42000.00, 30);

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