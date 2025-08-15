const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

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

    // Insert new user
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});