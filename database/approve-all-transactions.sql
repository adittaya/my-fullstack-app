-- Script to approve all pending transactions for testing

-- Check current pending transactions
SELECT 'Current pending recharges:' as info;
SELECT r.id, r.user_id, u.name as user_name, u.email as user_email, r.amount, r.utr, r.status, r.request_date 
FROM recharges r 
JOIN users u ON r.user_id = u.id 
WHERE r.status = 'pending'
ORDER BY r.request_date DESC;

SELECT 'Current pending withdrawals:' as info;
SELECT w.id, w.user_id, u.name as user_name, u.email as user_email, w.amount, w.net_amount, w.gst_amount, w.method, w.status, w.request_date 
FROM withdrawals w 
JOIN users u ON w.user_id = u.id 
WHERE w.status = 'pending'
ORDER BY w.request_date DESC;

-- Approve all pending recharges
DO $$
DECLARE
    r RECORD;
    user_current_balance DECIMAL;
    new_balance DECIMAL;
BEGIN
    -- Loop through all pending recharges
    FOR r IN 
        SELECT id, user_id, amount 
        FROM recharges 
        WHERE status = 'pending'
    LOOP
        -- Get current user balance
        SELECT balance INTO user_current_balance 
        FROM users 
        WHERE id = r.user_id;
        
        -- Calculate new balance
        new_balance := user_current_balance + r.amount;
        
        -- Update user balance
        UPDATE users 
        SET balance = new_balance 
        WHERE id = r.user_id;
        
        -- Update recharge status to approved
        UPDATE recharges 
        SET status = 'approved', 
            processed_date = NOW() 
        WHERE id = r.id;
        
        RAISE NOTICE 'Approved recharge #% for user % (₹%), new balance: ₹%', r.id, r.user_id, r.amount, new_balance;
    END LOOP;
END $$;

-- Approve all pending withdrawals
DO $$
DECLARE
    w RECORD;
    user_current_balance DECIMAL;
    new_balance DECIMAL;
BEGIN
    -- Loop through all pending withdrawals
    FOR w IN 
        SELECT id, user_id, amount 
        FROM withdrawals 
        WHERE status = 'pending'
    LOOP
        -- Get current user balance
        SELECT balance INTO user_current_balance 
        FROM users 
        WHERE id = w.user_id;
        
        -- Note: For withdrawals, we don't deduct from balance in this script since they're already processed
        -- In the real app, withdrawals would deduct from the user's balance
        
        -- Update withdrawal status to approved
        UPDATE withdrawals 
        SET status = 'approved', 
            processed_date = NOW() 
        WHERE id = w.id;
        
        RAISE NOTICE 'Approved withdrawal #% for user % (₹%)', w.id, w.user_id, w.amount;
    END LOOP;
END $$;

-- Show updated transactions
SELECT 'Approved recharges:' as info;
SELECT r.id, r.user_id, u.name as user_name, u.email as user_email, r.amount, r.utr, r.status, r.request_date 
FROM recharges r 
JOIN users u ON r.user_id = u.id 
WHERE r.status = 'approved'
ORDER BY r.request_date DESC;

SELECT 'Approved withdrawals:' as info;
SELECT w.id, w.user_id, u.name as user_name, u.email as user_email, w.amount, w.net_amount, w.gst_amount, w.method, w.status, w.request_date 
FROM withdrawals w 
JOIN users u ON w.user_id = u.id 
WHERE w.status = 'approved'
ORDER BY w.request_date DESC;

-- Show updated user balances
SELECT 'Updated user balances:' as info;
SELECT id, name, email, balance 
FROM users 
ORDER BY id;