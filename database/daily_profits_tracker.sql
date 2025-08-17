-- Create daily_profits table to track processed daily profits
CREATE TABLE IF NOT EXISTS daily_profits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  investment_id INTEGER REFERENCES investments(id),
  amount DECIMAL(10, 2) NOT NULL,
  processed_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_daily_profits_user_id ON daily_profits(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_profits_investment_id ON daily_profits(investment_id);
CREATE INDEX IF NOT EXISTS idx_daily_profits_processed_date ON daily_profits(processed_date);