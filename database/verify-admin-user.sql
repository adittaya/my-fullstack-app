-- Script to verify admin user exists and has correct permissions

-- Check if admin user exists
SELECT 
    id,
    name,
    email,
    is_admin,
    balance,
    created_at
FROM users 
WHERE email = 'admin@investpro.com';

-- Check if admin user has admin privileges
SELECT 
    'Admin user has admin privileges: ' || 
    CASE 
        WHEN EXISTS (SELECT 1 FROM users WHERE email = 'admin@investpro.com' AND is_admin = true) 
        THEN 'YES' 
        ELSE 'NO' 
    END as status;

-- Count total admin users
SELECT 'Total admin users: ' || COUNT(*) as status 
FROM users 
WHERE is_admin = true;

-- List all users with their admin status
SELECT 
    id,
    name,
    email,
    is_admin,
    balance
FROM users 
ORDER BY is_admin DESC, id;

-- Test admin authentication (simulates what the backend does)
-- This checks if we can find the admin user by email
SELECT 
    id,
    name,
    email,
    is_admin
FROM users 
WHERE email = 'admin@investpro.com' 
AND is_admin = true;

-- If the above query returns a row, the admin user is properly configured