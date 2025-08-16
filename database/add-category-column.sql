-- Add category column to product_plans table
ALTER TABLE product_plans ADD COLUMN category VARCHAR(100) DEFAULT 'general';

-- Update existing plans with appropriate categories
UPDATE product_plans SET category = 'beginner' WHERE id IN (1, 2);
UPDATE product_plans SET category = 'intermediate' WHERE id IN (3, 4);
UPDATE product_plans SET category = 'advanced' WHERE id IN (5, 6);
UPDATE product_plans SET category = 'premium' WHERE id IN (7, 8, 9, 10);

-- Verify the updates
SELECT id, name, category FROM product_plans ORDER BY id;