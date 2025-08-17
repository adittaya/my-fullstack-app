-- Migration script to add days_left column and create daily_profits table

-- Add days_left column to investments table
ALTER TABLE investments ADD COLUMN IF NOT EXISTS days_left INTEGER;

-- Update existing investments to have days_left value based on their plan
-- This is a one-time migration script to populate the days_left column for existing investments
UPDATE investments 
SET days_left = product_plans.duration_days
FROM product_plans 
WHERE investments.plan_id = product_plans.id 
AND investments.days_left IS NULL;

-- Add a comment to explain the purpose of the days_left column
COMMENT ON COLUMN investments.days_left IS 'Number of days left in the investment plan. Decreases by 1 each day when daily profit is processed.';

-- Create daily_profits table to track processed daily profits
CREATE TABLE IF NOT EXISTS daily_profits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  investment_id INTEGER REFERENCES investments(id),
  amount DECIMAL(10, 2) NOT NULL,
  processed_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_daily_profits_user_id ON daily_profits(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_profits_investment_id ON daily_profits(investment_id);
CREATE INDEX IF NOT EXISTS idx_daily_profits_processed_date ON daily_profits(processed_date);

-- Add is_admin column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add updated_at column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add category column to product_plans table if it doesn't exist
ALTER TABLE product_plans ADD COLUMN IF NOT EXISTS category VARCHAR(100) NOT NULL DEFAULT 'general';