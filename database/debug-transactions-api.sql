-- Script to test if the transactions API endpoints are working correctly

-- First, let's check if we have the admin user
SELECT 'Admin user check:' as info;
SELECT id, name, email, is_admin FROM users WHERE email = 'admin@investpro.com';

-- Check if the admin user has any recharges
SELECT 'Admin user recharges:' as info;
SELECT id, user_id, amount, utr, status, request_date 
FROM recharges 
WHERE user_id = (SELECT id FROM users WHERE email = 'admin@investpro.com')
ORDER BY request_date DESC;

-- Check if the admin user has any withdrawals
SELECT 'Admin user withdrawals:' as info;
SELECT id, user_id, amount, gst_amount, net_amount, method, details, status, request_date 
FROM withdrawals 
WHERE user_id = (SELECT id FROM users WHERE email = 'admin@investpro.com')
ORDER BY request_date DESC;

-- Check the JWT secret (this is just for debugging, don't expose in production)
SELECT 'JWT Secret (first 10 chars):' as info, 
       SUBSTRING(current_setting('app.settings.jwt_secret', true) FROM 1 FOR 10) as jwt_secret_preview;

-- Let's try to manually decode a JWT token (this is a test, you'll need to replace the token)
-- This would normally be done in the backend with jwt.verify()
-- For now, let's just check that we can get the user ID from the database

-- Show all users with their IDs
SELECT 'All users with IDs:' as info;
SELECT id, name, email, is_admin FROM users ORDER BY id;

-- Show all recharges with user details
SELECT 'All recharges with user details:' as info;
SELECT r.id, r.user_id, u.name, u.email, r.amount, r.utr, r.status, r.request_date
FROM recharges r
JOIN users u ON r.user_id = u.id
ORDER BY r.request_date DESC;

-- Show all withdrawals with user details
SELECT 'All withdrawals with user details:' as info;
SELECT w.id, w.user_id, u.name, u.email, w.amount, w.gst_amount, w.net_amount, w.method, w.status, w.request_date
FROM withdrawals w
JOIN users u ON w.user_id = u.id
ORDER BY w.request_date DESC;