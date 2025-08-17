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