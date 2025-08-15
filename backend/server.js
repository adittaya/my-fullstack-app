const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config();

// Import helper functions
const { generateMarketingStats, generateFakeWithdrawal } = require('./helpers/fakeDataGenerator');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Log the port for debugging
console.log(`Attempting to start server on port: ${PORT}`);
console.log(`Environment variables:`);
console.log(`PORT: ${process.env.PORT}`);
console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? 'SET' : 'NOT SET'}`);
console.log(`SUPABASE_API_KEY: ${process.env.SUPABASE_API_KEY ? 'SET' : 'NOT SET'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? 'SET' : 'NOT SET'}`);

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_API_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Admin Authentication Middleware
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Check if user is admin (in a real app, you would check against a database)
    if (user.email !== 'admin@example.com') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = user;
    next();
  });
};

// Routes

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    // Check if user already exists
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (fetchError) {
      console.error('Supabase fetch error:', fetchError);
      return res.status(500).json({ error: 'Database error during user check' });
    }

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Insert new user with initial balance of 0
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          email,
          password, // In a real app, you should hash the password
          mobile,
          balance: 0,
          created_at: new Date()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Failed to register user' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: data.id, name: data.name, email: data.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: data.id,
        name: data.name,
        email: data.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, password')
      .eq('email', email)
      .limit(1);

    if (error) {
      console.error('Supabase fetch error:', error);
      return res.status(500).json({ error: 'Database error during login' });
    }

    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    // Check password (in a real app, you should compare hashed passwords)
    if (user.password !== password) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected data endpoint
app.get('/api/data', authenticateToken, async (req, res) => {
  try {
    // Fetch user data from Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, balance')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Supabase fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }

    res.json({
      message: 'Data fetched successfully',
      user
    });
  } catch (error) {
    console.error('Data fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product plans
app.get('/api/product-plans', authenticateToken, async (req, res) => {
  try {
    // Sample product plans - in a real app, these would come from a database
    const productPlans = [
      {
        id: 1,
        name: "Basic Plan",
        price: 500,
        dailyIncome: 50,
        totalReturn: 1500,
        durationDays: 30
      },
      {
        id: 2,
        name: "Silver Plan",
        price: 1000,
        dailyIncome: 120,
        totalReturn: 3600,
        durationDays: 30
      },
      {
        id: 3,
        name: "Gold Plan",
        price: 5000,
        dailyIncome: 650,
        totalReturn: 19500,
        durationDays: 30
      },
      {
        id: 4,
        name: "Platinum Plan",
        price: 10000,
        dailyIncome: 1400,
        totalReturn: 42000,
        durationDays: 30
      }
    ];

    res.json({
      message: 'Product plans fetched successfully',
      plans: productPlans
    });
  } catch (error) {
    console.error('Product plans fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Purchase product plan
app.post('/api/purchase-plan', authenticateToken, async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Supabase user fetch error:', userError);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }

    // Fetch plan details
    const productPlans = [
      { id: 1, name: "Basic Plan", price: 500 },
      { id: 2, name: "Silver Plan", price: 1000 },
      { id: 3, name: "Gold Plan", price: 5000 },
      { id: 4, name: "Platinum Plan", price: 10000 }
    ];

    const plan = productPlans.find(p => p.id == planId);
    
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Check if user has sufficient balance
    if (user.balance < plan.price) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Check if user already has a plan purchased this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: existingPurchases, error: purchaseError } = await supabase
      .from('investments')
      .select('id')
      .eq('user_id', userId)
      .gte('purchase_date', startOfMonth.toISOString());

    if (purchaseError) {
      console.error('Supabase purchase check error:', purchaseError);
      return res.status(500).json({ error: 'Failed to check existing purchases' });
    }

    if (existingPurchases.length > 0) {
      return res.status(400).json({ error: 'Only one plan can be purchased per month' });
    }

    // Deduct plan price from user balance
    const newBalance = user.balance - plan.price;
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (updateError) {
      console.error('Supabase balance update error:', updateError);
      return res.status(500).json({ error: 'Failed to update user balance' });
    }

    // Record the investment
    const { error: investmentError } = await supabase
      .from('investments')
      .insert([
        {
          user_id: userId,
          plan_id: planId,
          plan_name: plan.name,
          amount: plan.price,
          purchase_date: new Date().toISOString(),
          status: 'active'
        }
      ]);

    if (investmentError) {
      console.error('Supabase investment insert error:', investmentError);
      // Rollback balance update
      await supabase
        .from('users')
        .update({ balance: user.balance })
        .eq('id', userId);
      return res.status(500).json({ error: 'Failed to record investment' });
    }

    res.json({
      message: 'Plan purchased successfully',
      newBalance: newBalance
    });
  } catch (error) {
    console.error('Purchase plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user investments
app.get('/api/investments', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user investments
    const { data: investments, error } = await supabase
      .from('investments')
      .select('*')
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false });

    if (error) {
      console.error('Supabase investments fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch investments' });
    }

    res.json({
      message: 'Investments fetched successfully',
      investments
    });
  } catch (error) {
    console.error('Investments fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request withdrawal
app.post('/api/withdraw', authenticateToken, async (req, res) => {
  try {
    const { amount, method, details } = req.body; // method: 'bank' or 'upi', details: account/upi info
    const userId = req.user.id;

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ error: 'Invalid withdrawal amount' });
    }

    // Fetch user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Supabase user fetch error:', userError);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }

    // Check if user has sufficient balance
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Check if user has requested a withdrawal in the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const { data: recentWithdrawals, error: withdrawalError } = await supabase
      .from('withdrawals')
      .select('id')
      .eq('user_id', userId)
      .gte('request_date', twentyFourHoursAgo.toISOString());

    if (withdrawalError) {
      console.error('Supabase withdrawal check error:', withdrawalError);
      return res.status(500).json({ error: 'Failed to check recent withdrawals' });
    }

    if (recentWithdrawals.length > 0) {
      return res.status(400).json({ error: 'Only one withdrawal allowed every 24 hours' });
    }

    // Deduct 5% GST from amount
    const gstAmount = amount * 0.05;
    const netAmount = amount - gstAmount;

    // Deduct amount from user balance
    const newBalance = user.balance - amount;

    const { error: updateError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (updateError) {
      console.error('Supabase balance update error:', updateError);
      return res.status(500).json({ error: 'Failed to update user balance' });
    }

    // Record the withdrawal request
    const { error: withdrawalInsertError } = await supabase
      .from('withdrawals')
      .insert([
        {
          user_id: userId,
          amount: amount,
          gst_amount: gstAmount,
          net_amount: netAmount,
          method: method,
          details: details,
          request_date: new Date().toISOString(),
          status: 'pending' // pending, approved, rejected
        }
      ]);

    if (withdrawalInsertError) {
      console.error('Supabase withdrawal insert error:', withdrawalInsertError);
      // Rollback balance update
      await supabase
        .from('users')
        .update({ balance: user.balance })
        .eq('id', userId);
      return res.status(500).json({ error: 'Failed to record withdrawal request' });
    }

    res.json({
      message: 'Withdrawal request submitted successfully',
      newBalance: newBalance
    });
  } catch (error) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user withdrawals
app.get('/api/withdrawals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user withdrawals
    const { data: withdrawals, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', userId)
      .order('request_date', { ascending: false });

    if (error) {
      console.error('Supabase withdrawals fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch withdrawals' });
    }

    res.json({
      message: 'Withdrawals fetched successfully',
      withdrawals
    });
  } catch (error) {
    console.error('Withdrawals fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request recharge
app.post('/api/recharge', authenticateToken, async (req, res) => {
  try {
    const { amount, utr } = req.body; // UPI Transaction Reference
    const userId = req.user.id;

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({ error: 'Invalid recharge amount' });
    }

    // Validate UTR
    if (!utr || utr.length < 5) {
      return res.status(400).json({ error: 'Valid UTR is required' });
    }

    // Record the recharge request
    const { error: rechargeError } = await supabase
      .from('recharges')
      .insert([
        {
          user_id: userId,
          amount: amount,
          utr: utr,
          request_date: new Date().toISOString(),
          status: 'pending' // pending, approved, rejected
        }
      ]);

    if (rechargeError) {
      console.error('Supabase recharge insert error:', rechargeError);
      return res.status(500).json({ error: 'Failed to record recharge request' });
    }

    res.json({
      message: 'Recharge request submitted successfully. Waiting for admin approval.'
    });
  } catch (error) {
    console.error('Recharge request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user recharges
app.get('/api/recharges', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user recharges
    const { data: recharges, error } = await supabase
      .from('recharges')
      .select('*')
      .eq('user_id', userId)
      .order('request_date', { ascending: false });

    if (error) {
      console.error('Supabase recharges fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch recharges' });
    }

    res.json({
      message: 'Recharges fetched successfully',
      recharges
    });
  } catch (error) {
    console.error('Recharges fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get marketing stats
app.get('/api/marketing-stats', (req, res) => {
  try {
    const stats = generateMarketingStats();
    
    // Sample fake reviews
    const fakeReviews = [
      {
        id: 1,
        name: "Rajesh Kumar",
        rating: 5,
        comment: "I withdrew ₹50,000 in a single transaction. Amazing platform!",
        date: "2025-07-15"
      },
      {
        id: 2,
        name: "Priya Sharma",
        rating: 5,
        comment: "Best investment platform I've used. Quick withdrawals and great daily returns.",
        date: "2025-07-10"
      },
      {
        id: 3,
        name: "Amit Patel",
        rating: 4,
        comment: "Reliable and trustworthy. My monthly income has helped me a lot.",
        date: "2025-07-05"
      },
      {
        id: 4,
        name: "Sneha Reddy",
        rating: 5,
        comment: "Withdrawal of ₹25,000 processed within 2 hours. Impressive!",
        date: "2025-06-28"
      },
      {
        id: 5,
        name: "Vikas Gupta",
        rating: 5,
        comment: "5 years anniversary achievement! Been with them since day one. Never disappointed.",
        date: "2025-06-20"
      }
    ];
    
    res.json({
      message: 'Marketing stats fetched successfully',
      stats,
      reviews: fakeReviews
    });
  } catch (error) {
    console.error('Marketing stats fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get fake withdrawal for popup
app.get('/api/fake-withdrawal', (req, res) => {
  try {
    const fakeWithdrawal = generateFakeWithdrawal();
    res.json({
      message: 'Fake withdrawal generated',
      withdrawal: fakeWithdrawal
    });
  } catch (error) {
    console.error('Fake withdrawal generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Copy UPI ID endpoint
app.get('/api/upi-id', (req, res) => {
  try {
    const upiId = "7047571829@upi";
    res.json({
      message: 'UPI ID fetched successfully',
      upiId: upiId
    });
  } catch (error) {
    console.error('UPI ID fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Copy referral link endpoint
app.get('/api/referral-link', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const referralLink = `https://investment-pro-official.netlify.app/referral/${userId}`;
    res.json({
      message: 'Referral link generated successfully',
      referralLink: referralLink
    });
  } catch (error) {
    console.error('Referral link generation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin endpoints
// Get pending recharges
app.get('/api/admin/recharges/pending', authenticateAdmin, async (req, res) => {
  try {
    const { data: recharges, error } = await supabase
      .from('recharges')
      .select('*')
      .eq('status', 'pending')
      .order('request_date', { ascending: true });

    if (error) {
      console.error('Supabase recharges fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch pending recharges' });
    }

    res.json({
      message: 'Pending recharges fetched successfully',
      recharges
    });
  } catch (error) {
    console.error('Pending recharges fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending withdrawals
app.get('/api/admin/withdrawals/pending', authenticateAdmin, async (req, res) => {
  try {
    const { data: withdrawals, error } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('status', 'pending')
      .order('request_date', { ascending: true });

    if (error) {
      console.error('Supabase withdrawals fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch pending withdrawals' });
    }

    res.json({
      message: 'Pending withdrawals fetched successfully',
      withdrawals
    });
  } catch (error) {
    console.error('Pending withdrawals fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve recharge
app.post('/api/admin/recharge/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const rechargeId = req.params.id;

    // Get the recharge details
    const { data: recharge, error: fetchError } = await supabase
      .from('recharges')
      .select('*')
      .eq('id', rechargeId)
      .single();

    if (fetchError) {
      console.error('Supabase recharge fetch error:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch recharge details' });
    }

    if (!recharge) {
      return res.status(404).json({ error: 'Recharge not found' });
    }

    if (recharge.status !== 'pending') {
      return res.status(400).json({ error: 'Recharge is not pending' });
    }

    // Update recharge status to approved
    const { error: updateError } = await supabase
      .from('recharges')
      .update({ 
        status: 'approved',
        processed_date: new Date().toISOString()
      })
      .eq('id', rechargeId);

    if (updateError) {
      console.error('Supabase recharge update error:', updateError);
      return res.status(500).json({ error: 'Failed to approve recharge' });
    }

    // Add amount to user's balance
    const { error: userUpdateError } = await supabase
      .rpc('increment_user_balance', {
        user_id: recharge.user_id,
        amount: recharge.amount
      });

    if (userUpdateError) {
      console.error('Supabase user balance update error:', userUpdateError);
      // Rollback recharge status update
      await supabase
        .from('recharges')
        .update({ 
          status: 'pending',
          processed_date: null
        })
        .eq('id', rechargeId);
      return res.status(500).json({ error: 'Failed to update user balance' });
    }

    res.json({
      message: 'Recharge approved successfully',
      recharge: { ...recharge, status: 'approved' }
    });
  } catch (error) {
    console.error('Recharge approval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject recharge
app.post('/api/admin/recharge/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    const rechargeId = req.params.id;

    // Get the recharge details
    const { data: recharge, error: fetchError } = await supabase
      .from('recharges')
      .select('*')
      .eq('id', rechargeId)
      .single();

    if (fetchError) {
      console.error('Supabase recharge fetch error:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch recharge details' });
    }

    if (!recharge) {
      return res.status(404).json({ error: 'Recharge not found' });
    }

    if (recharge.status !== 'pending') {
      return res.status(400).json({ error: 'Recharge is not pending' });
    }

    // Update recharge status to rejected
    const { error: updateError } = await supabase
      .from('recharges')
      .update({ 
        status: 'rejected',
        processed_date: new Date().toISOString()
      })
      .eq('id', rechargeId);

    if (updateError) {
      console.error('Supabase recharge update error:', updateError);
      return res.status(500).json({ error: 'Failed to reject recharge' });
    }

    res.json({
      message: 'Recharge rejected successfully',
      recharge: { ...recharge, status: 'rejected' }
    });
  } catch (error) {
    console.error('Recharge rejection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve withdrawal
app.post('/api/admin/withdrawal/:id/approve', authenticateAdmin, async (req, res) => {
  try {
    const withdrawalId = req.params.id;

    // Get the withdrawal details
    const { data: withdrawal, error: fetchError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (fetchError) {
      console.error('Supabase withdrawal fetch error:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch withdrawal details' });
    }

    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'Withdrawal is not pending' });
    }

    // Update withdrawal status to approved
    const { error: updateError } = await supabase
      .from('withdrawals')
      .update({ 
        status: 'approved',
        processed_date: new Date().toISOString()
      })
      .eq('id', withdrawalId);

    if (updateError) {
      console.error('Supabase withdrawal update error:', updateError);
      return res.status(500).json({ error: 'Failed to approve withdrawal' });
    }

    res.json({
      message: 'Withdrawal approved successfully',
      withdrawal: { ...withdrawal, status: 'approved' }
    });
  } catch (error) {
    console.error('Withdrawal approval error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject withdrawal
app.post('/api/admin/withdrawal/:id/reject', authenticateAdmin, async (req, res) => {
  try {
    const withdrawalId = req.params.id;

    // Get the withdrawal details
    const { data: withdrawal, error: fetchError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (fetchError) {
      console.error('Supabase withdrawal fetch error:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch withdrawal details' });
    }

    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'Withdrawal is not pending' });
    }

    // Update withdrawal status to rejected
    const { error: updateError } = await supabase
      .from('withdrawals')
      .update({ 
        status: 'rejected',
        processed_date: new Date().toISOString()
      })
      .eq('id', withdrawalId);

    if (updateError) {
      console.error('Supabase withdrawal update error:', updateError);
      return res.status(500).json({ error: 'Failed to reject withdrawal' });
    }

    // Refund the amount to user's balance
    const { error: userUpdateError } = await supabase
      .rpc('increment_user_balance', {
        user_id: withdrawal.user_id,
        amount: withdrawal.amount
      });

    if (userUpdateError) {
      console.error('Supabase user balance refund error:', userUpdateError);
      // Note: In a real app, you might want to handle this more carefully
    }

    res.json({
      message: 'Withdrawal rejected successfully and amount refunded',
      withdrawal: { ...withdrawal, status: 'rejected' }
    });
  } catch (error) {
    console.error('Withdrawal rejection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search users
app.get('/api/admin/users/search', authenticateAdmin, async (req, res) => {
  try {
    const query = req.query.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters long' });
    }

    // Search users by name, email, or mobile
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, mobile, balance')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%,mobile.ilike.%${query}%`)
      .limit(20);

    if (error) {
      console.error('Supabase users search error:', error);
      return res.status(500).json({ error: 'Failed to search users' });
    }

    res.json({
      message: 'Users searched successfully',
      users
    });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Adjust user balance
app.post('/api/admin/user/balance-adjust', authenticateAdmin, async (req, res) => {
  try {
    const { userId, amount, reason } = req.body;

    // Validate inputs
    if (!userId || !amount || !reason) {
      return res.status(400).json({ error: 'User ID, amount, and reason are required' });
    }

    // Update user balance
    const { error: userUpdateError } = await supabase
      .rpc('increment_user_balance', {
        user_id: userId,
        amount: parseFloat(amount)
      });

    if (userUpdateError) {
      console.error('Supabase user balance adjustment error:', userUpdateError);
      return res.status(500).json({ error: 'Failed to adjust user balance' });
    }

    // Log the balance adjustment
    const { error: logError } = await supabase
      .from('balance_adjustments')
      .insert([
        {
          user_id: userId,
          amount: parseFloat(amount),
          reason: reason,
          admin_id: req.user.id,
          adjustment_date: new Date().toISOString()
        }
      ]);

    if (logError) {
      console.error('Supabase balance adjustment log error:', logError);
      // Note: In a real app, you might want to handle this more carefully
    }

    res.json({
      message: 'User balance adjusted successfully'
    });
  } catch (error) {
    console.error('User balance adjustment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});