-- Script to diagnose user ID and JWT token issues

-- First, let's check all users
SELECT 'All users in database:' as info;
SELECT id, name, email, is_admin FROM users ORDER BY id;

-- Check if there are any recharges at all
SELECT 'Total recharges in database:' as info, COUNT(*) as count FROM recharges;

-- Check if there are any withdrawals at all
SELECT 'Total withdrawals in database:' as info, COUNT(*) as count FROM withdrawals;

-- Show all recharges with user info
SELECT 'All recharges with user info:' as info;
SELECT 
    r.id as recharge_id,
    r.user_id,
    r.amount,
    r.utr,
    r.status,
    r.request_date,
    u.name as user_name,
    u.email as user_email,
    u.is_admin
FROM recharges r
LEFT JOIN users u ON r.user_id = u.id
ORDER BY r.request_date DESC;

-- Show all withdrawals with user info
SELECT 'All withdrawals with user info:' as info;
SELECT 
    w.id as withdrawal_id,
    w.user_id,
    w.amount,
    w.gst_amount,
    w.net_amount,
    w.method,
    w.status,
    w.request_date,
    u.name as user_name,
    u.email as user_email,
    u.is_admin
FROM withdrawals w
LEFT JOIN users u ON w.user_id = u.id
ORDER BY w.request_date DESC;

-- Check if the admin user exists and has transactions
SELECT 'Admin user details:' as info;
SELECT id, name, email, is_admin FROM users WHERE email = 'admin@investpro.com';

-- Check transactions for admin user specifically
SELECT 'Recharges for admin user:' as info;
SELECT id, amount, utr, status, request_date 
FROM recharges 
WHERE user_id = (SELECT id FROM users WHERE email = 'admin@investpro.com')
ORDER BY request_date DESC;

SELECT 'Withdrawals for admin user:' as info;
SELECT id, amount, gst_amount, net_amount, method, status, request_date 
FROM withdrawals 
WHERE user_id = (SELECT id FROM users WHERE email = 'admin@investpro.com')
ORDER BY request_date DESC;

-- Check if there are any orphaned transactions (user_id doesn't exist)
SELECT 'Orphaned recharges (no matching user):' as info;
SELECT r.id, r.user_id, r.amount, r.utr, r.status, r.request_date
FROM recharges r
LEFT JOIN users u ON r.user_id = u.id
WHERE u.id IS NULL;

SELECT 'Orphaned withdrawals (no matching user):' as info;
SELECT w.id, w.user_id, w.amount, w.method, w.status, w.request_date
FROM withdrawals w
LEFT JOIN users u ON w.user_id = u.id
WHERE u.id IS NULL;