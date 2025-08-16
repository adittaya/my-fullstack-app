-- TEST SCRIPT FOR CLEAN DATABASE SCHEMA
-- This script tests that the clean schema works correctly

-- Test 1: Check that all tables exist
SELECT 'users table exists' as test, 
       (SELECT count(*) > 0 FROM information_schema.tables WHERE table_name = 'users') as result
UNION ALL
SELECT 'product_plans table exists' as test,
       (SELECT count(*) > 0 FROM information_schema.tables WHERE table_name = 'product_plans') as result
UNION ALL
SELECT 'investments table exists' as test,
       (SELECT count(*) > 0 FROM information_schema.tables WHERE table_name = 'investments') as result
UNION ALL
SELECT 'withdrawals table exists' as test,
       (SELECT count(*) > 0 FROM information_schema.tables WHERE table_name = 'withdrawals') as result
UNION ALL
SELECT 'recharges table exists' as test,
       (SELECT count(*) > 0 FROM information_schema.tables WHERE table_name = 'recharges') as result
UNION ALL
SELECT 'balance_adjustments table exists' as test,
       (SELECT count(*) > 0 FROM information_schema.tables WHERE table_name = 'balance_adjustments') as result;

-- Test 2: Check that sample data was inserted
SELECT 'Sample users exist' as test,
       (SELECT count(*) >= 4 FROM users) as result
UNION ALL
SELECT 'Sample product plans exist' as test,
       (SELECT count(*) >= 10 FROM product_plans) as result
UNION ALL
SELECT 'Sample investments exist' as test,
       (SELECT count(*) >= 4 FROM investments) as result
UNION ALL
SELECT 'Sample recharges exist' as test,
       (SELECT count(*) >= 2 FROM recharges) as result
UNION ALL
SELECT 'Sample withdrawals exist' as test,
       (SELECT count(*) >= 2 FROM withdrawals) as result;

-- Test 3: Check that admin user exists
SELECT 'Admin user exists' as test,
       (SELECT count(*) > 0 FROM users WHERE email = 'admin@investpro.com' AND is_admin = true) as result;

-- Test 4: Test balance functions
SELECT 'Increment balance function works' as test,
       (SELECT increment_user_balance(2, 100.00) IS NULL) as result
UNION ALL
SELECT 'Decrement balance function works' as test,
       (SELECT decrement_user_balance(2, 50.00)) as result;

-- Test 5: Check updated balance
SELECT 'User balance updated correctly' as test,
       (SELECT balance = 1050.00 FROM users WHERE id = 2) as result;

-- Reset test user balance to original value
UPDATE users SET balance = 1000.00 WHERE id = 2;

-- Final verification
SELECT 'All tests completed successfully' as status;