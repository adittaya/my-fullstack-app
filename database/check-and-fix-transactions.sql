-- Script to check and fix transaction display issues

-- First, let's check if we have any users
SELECT 'Users in database:' as info, COUNT(*) as count FROM users;

-- Check if we have any recharges
SELECT 'Recharges in database:' as info, COUNT(*) as count FROM recharges;

-- Check if we have any withdrawals
SELECT 'Withdrawals in database:' as info, COUNT(*) as count FROM withdrawals;

-- Check if we have any investments
SELECT 'Investments in database:' as info, COUNT(*) as count FROM investments;

-- Show sample users
SELECT 'Sample users:' as info;
SELECT id, name, email, balance, is_admin FROM users ORDER BY id;

-- Show sample recharges
SELECT 'Sample recharges:' as info;
SELECT r.id, r.user_id, u.name as user_name, u.email as user_email, r.amount, r.utr, r.status, r.request_date 
FROM recharges r 
JOIN users u ON r.user_id = u.id 
ORDER BY r.request_date DESC;

-- Show sample withdrawals
SELECT 'Sample withdrawals:' as info;
SELECT w.id, w.user_id, u.name as user_name, u.email as user_email, w.amount, w.net_amount, w.gst_amount, w.method, w.status, w.request_date 
FROM withdrawals w 
JOIN users u ON w.user_id = u.id 
ORDER BY w.request_date DESC;

-- Show sample investments
SELECT 'Sample investments:' as info;
SELECT i.id, i.user_id, u.name as user_name, u.email as user_email, i.plan_name, i.amount, i.status, i.purchase_date 
FROM investments i 
JOIN users u ON i.user_id = u.id 
ORDER BY i.purchase_date DESC;

-- If there are no transactions, let's create some sample ones
-- Create sample pending recharges
INSERT INTO recharges (user_id, amount, utr, request_date, status) 
SELECT id, 1000.00, 'UTR123456789', NOW() - INTERVAL '1 hour', 'pending' 
FROM users 
WHERE email = 'admin@investpro.com'
AND NOT EXISTS (SELECT 1 FROM recharges WHERE user_id = users.id);

INSERT INTO recharges (user_id, amount, utr, request_date, status) 
SELECT id, 2000.00, 'UTR987654321', NOW() - INTERVAL '2 hours', 'pending' 
FROM users 
WHERE email = 'john@example.com'
AND NOT EXISTS (SELECT 1 FROM recharges WHERE user_id = users.id);

-- Create sample pending withdrawals
INSERT INTO withdrawals (user_id, amount, gst_amount, net_amount, method, details, request_date, status) 
SELECT id, 500.00, 90.00, 410.00, 'bank', 'Account: 123456789, IFSC: ABCD1234567', NOW() - INTERVAL '30 minutes', 'pending' 
FROM users 
WHERE email = 'admin@investpro.com'
AND NOT EXISTS (SELECT 1 FROM withdrawals WHERE user_id = users.id);

INSERT INTO withdrawals (user_id, amount, gst_amount, net_amount, method, details, request_date, status) 
SELECT id, 300.00, 54.00, 246.00, 'upi', 'UPI ID: user@upi', NOW() - INTERVAL '45 minutes', 'pending' 
FROM users 
WHERE email = 'jane@example.com'
AND NOT EXISTS (SELECT 1 FROM withdrawals WHERE user_id = users.id);

-- Verify that transactions were created
SELECT 'After creating sample transactions:' as info;
SELECT 'Recharges in database:' as info, COUNT(*) as count FROM recharges;
SELECT 'Withdrawals in database:' as info, COUNT(*) as count FROM withdrawals;

-- Show the transactions again to verify they exist
SELECT 'Updated sample recharges:' as info;
SELECT r.id, r.user_id, u.name as user_name, u.email as user_email, r.amount, r.utr, r.status, r.request_date 
FROM recharges r 
JOIN users u ON r.user_id = u.id 
ORDER BY r.request_date DESC;

SELECT 'Updated sample withdrawals:' as info;
SELECT w.id, w.user_id, u.name as user_name, u.email as user_email, w.amount, w.net_amount, w.gst_amount, w.method, w.status, w.request_date 
FROM withdrawals w 
JOIN users u ON w.user_id = u.id 
ORDER BY w.request_date DESC;