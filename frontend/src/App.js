import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

// Determine the API base URL based on environment
const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // In production, use the Render backend URL
    return 'https://my-fullstack-app-backend-2omq.onrender.com';
  } else {
    // In development, use the proxy
    return '';
  }
};

const API_BASE_URL = getApiBaseUrl();

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [view, setView] = useState('login'); // 'login', 'register', 'dashboard', 'plans', 'withdraw', 'recharge', 'admin'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: ''
  });
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Investment features
  const [productPlans, setProductPlans] = useState([]);
  const [userInvestments, setUserInvestments] = useState([]);
  const [userWithdrawals, setUserWithdrawals] = useState([]);
  const [userRecharges, setUserRecharges] = useState([]);
  
  // Withdrawal form
  const [withdrawalForm, setWithdrawalForm] = useState({
    amount: '',
    method: 'bank', // 'bank' or 'upi'
    details: ''
  });
  
  // Recharge form
  const [rechargeForm, setRechargeForm] = useState({
    amount: '',
    utr: ''
  });
  
  // Marketing features
  const [marketingStats, setMarketingStats] = useState({});
  const [fakeWithdrawal, setFakeWithdrawal] = useState(null);
  const [showFakeWithdrawal, setShowFakeWithdrawal] = useState(false);
  
  // Referral
  const [referralLink, setReferralLink] = useState('');
  
  // Admin features
  const [pendingRecharges, setPendingRecharges] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [adminUserSearch, setAdminUserSearch] = useState('');
  const [adminUserResults, setAdminUserResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [adjustBalanceForm, setAdjustBalanceForm] = useState({
    userId: '',
    amount: '',
    reason: ''
  });
  
  // Timer refs
  const fakeWithdrawalTimer = useRef(null);
  
  // Check if user is already logged in
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setView('dashboard');
      fetchUserData(savedToken);
      fetchMarketingStats();
    } else {
      // For non-logged in users, still fetch marketing stats
      fetchMarketingStats();
    }
    
    // Start fake withdrawal timer for non-logged in users
    startFakeWithdrawalTimer();
    
    // Cleanup timer on unmount
    return () => {
      if (fakeWithdrawalTimer.current) {
        clearInterval(fakeWithdrawalTimer.current);
      }
    };
  }, []);
  
  // Fetch user data when token changes
  useEffect(() => {
    if (token) {
      fetchUserData(token);
      fetchMarketingStats();
      startFakeWithdrawalTimer();
    }
  }, [token]);
  
  // Handle fake withdrawal popups
  const startFakeWithdrawalTimer = () => {
    // Clear existing timer if any
    if (fakeWithdrawalTimer.current) {
      clearInterval(fakeWithdrawalTimer.current);
    }
    
    // Start new timer (every 10 seconds)
    fakeWithdrawalTimer.current = setInterval(() => {
      generateFakeWithdrawal();
    }, 10000); // Every 10 seconds
  };
  
  const generateFakeWithdrawal = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/fake-withdrawal`);
      setFakeWithdrawal(response.data.withdrawal);
      setShowFakeWithdrawal(true);
      
      // Hide popup after 5 seconds
      setTimeout(() => {
        setShowFakeWithdrawal(false);
      }, 5000);
    } catch (err) {
      console.error('Failed to generate fake withdrawal:', err);
    }
  };
  
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleWithdrawalChange = (e) => {
    setWithdrawalForm({
      ...withdrawalForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handleRechargeChange = (e) => {
    setRechargeForm({
      ...rechargeForm,
      [e.target.name]: e.target.value
    });
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/register`, formData);
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setSuccess('Registration successful!');
      setView('dashboard');
      fetchUserData(response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/login`, {
        email: formData.email,
        password: formData.password
      });
      
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setSuccess('Login successful!');
      setView('dashboard');
      fetchUserData(response.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserData = async (authToken) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/data`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setUserData(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch user data');
    }
  };
  
  const fetchMarketingStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/marketing-stats`);
      setMarketingStats(response.data.stats);
    } catch (err) {
      console.error('Failed to fetch marketing stats:', err);
    }
  };
  
  const fetchProductPlans = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/product-plans`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setProductPlans(response.data.plans);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch product plans');
    }
  };
  
  const fetchUserInvestments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/investments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUserInvestments(response.data.investments);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch investments');
    }
  };
  
  const fetchUserWithdrawals = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/withdrawals`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUserWithdrawals(response.data.withdrawals);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch withdrawals');
    }
  };
  
  const fetchUserRecharges = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/recharges`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUserRecharges(response.data.recharges);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch recharges');
    }
  };
  
  const fetchReferralLink = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/referral-link`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setReferralLink(response.data.referralLink);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch referral link');
    }
  };
  
  const handlePurchasePlan = async (planId) => {
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/purchase-plan`, 
        { planId }, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccess('Plan purchased successfully!');
      // Refresh user data and investments
      fetchUserData(token);
      fetchUserInvestments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to purchase plan');
    } finally {
      setLoading(false);
    }
  };
  
  const handleWithdrawalRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/withdraw`, 
        withdrawalForm, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccess('Withdrawal request submitted successfully!');
      // Reset form
      setWithdrawalForm({
        amount: '',
        method: 'bank',
        details: ''
      });
      // Refresh user data and withdrawals
      fetchUserData(token);
      fetchUserWithdrawals();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRechargeRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/recharge`, 
        rechargeForm, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccess('Recharge request submitted successfully! Waiting for admin approval.');
      // Reset form
      setRechargeForm({
        amount: '',
        utr: ''
      });
      // Refresh recharges
      fetchUserRecharges();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit recharge request');
    } finally {
      setLoading(false);
    }
  };
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('Copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    }).catch(err => {
      setError('Failed to copy to clipboard');
    });
  };
  
  const copyUPIId = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/upi-id`);
      copyToClipboard(response.data.upiId);
    } catch (err) {
      setError('Failed to fetch UPI ID');
    }
  };
  
  const copyReferralLink = () => {
    if (referralLink) {
      copyToClipboard(referralLink);
    } else {
      fetchReferralLink().then(() => {
        if (referralLink) {
          copyToClipboard(referralLink);
        }
      });
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setUserData(null);
    setView('login');
    setFormData({
      name: '',
      email: '',
      password: '',
      mobile: ''
    });
    
    // Clear timers
    if (fakeWithdrawalTimer.current) {
      clearInterval(fakeWithdrawalTimer.current);
    }
  };
  
  // Admin functions
  const fetchPendingRecharges = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/recharges/pending`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPendingRecharges(response.data.recharges);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch pending recharges');
    }
  };
  
  const fetchPendingWithdrawals = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/withdrawals/pending`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPendingWithdrawals(response.data.withdrawals);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch pending withdrawals');
    }
  };
  
  const handleApproveRecharge = async (rechargeId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/recharge/${rechargeId}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccess('Recharge approved successfully!');
      fetchPendingRecharges();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve recharge');
    }
  };
  
  const handleRejectRecharge = async (rechargeId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/recharge/${rechargeId}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccess('Recharge rejected successfully!');
      fetchPendingRecharges();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject recharge');
    }
  };
  
  const handleApproveWithdrawal = async (withdrawalId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/withdrawal/${withdrawalId}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccess('Withdrawal approved successfully!');
      fetchPendingWithdrawals();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve withdrawal');
    }
  };
  
  const handleRejectWithdrawal = async (withdrawalId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/withdrawal/${withdrawalId}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccess('Withdrawal rejected successfully!');
      fetchPendingWithdrawals();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject withdrawal');
    }
  };
  
  const handleSearchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/users/search?query=${adminUserSearch}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAdminUserResults(response.data.users);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to search users');
    }
  };
  
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setAdjustBalanceForm({
      userId: user.id,
      amount: '',
      reason: ''
    });
  };
  
  const handleAdjustBalance = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/user/balance-adjust`, adjustBalanceForm, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccess('Balance adjusted successfully!');
      // Refresh user data
      if (selectedUser && selectedUser.id === adjustBalanceForm.userId) {
        fetchUserData(token);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to adjust balance');
    }
  };
  
  // View rendering functions
  const renderLoginForm = () => (
    <div className="auth-form">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <form onSubmit={handleLogin}>
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <p>
        Don't have an account?{' '}
        <button onClick={() => setView('register')}>Register</button>
      </p>
      {/* Admin access */}
      <p>
        <button onClick={() => setView('admin-login')} className="admin-login-btn">
          Admin Login
        </button>
      </p>
    </div>
  );
  
  const renderRegisterForm = () => (
    <div className="auth-form">
      <h2>Register</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <form onSubmit={handleRegister}>
        <div>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <input
            type="tel"
            name="mobile"
            placeholder="Mobile Number"
            value={formData.mobile}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p>
        Already have an account?{' '}
        <button onClick={() => setView('login')}>Login</button>
      </p>
    </div>
  );
  
  const renderDashboard = () => (
    <div className="dashboard">
      <div className="header">
        <h2>Welcome, {userData?.name || user?.name}!</h2>
        <div className="header-buttons">
          <button onClick={handleLogout}>Logout</button>
          {/* Admin panel access for admins */}
          {user && user.email === 'admin@example.com' && (
            <button onClick={() => setView('admin')} className="admin-panel-btn">
              Admin Panel
            </button>
          )}
        </div>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {/* User Info */}
      <div className="user-info">
        <h3>User Information</h3>
        <p><strong>Email:</strong> {userData?.email || user?.email}</p>
        <p><strong>Mobile:</strong> {userData?.mobile || 'Not provided'}</p>
        <p><strong>Wallet Balance:</strong> ₹{userData?.balance || 0}</p>
      </div>
      
      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => {
          fetchProductPlans();
          setView('plans');
        }}>View Plans</button>
        <button onClick={() => setView('withdraw')}>Withdraw</button>
        <button onClick={() => setView('recharge')}>Recharge</button>
        <button onClick={copyReferralLink}>Share Referral</button>
      </div>
      
      {/* Investments Summary */}
      <div className="investments-summary">
        <h3>Your Investments</h3>
        <p>Total Investments: ₹{(userInvestments.reduce((sum, inv) => sum + inv.amount, 0)).toFixed(2)}</p>
        <p>Active Plans: {userInvestments.filter(inv => inv.status === 'active').length}</p>
      </div>
      
      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-item">
          <p>Last Login: Just now</p>
        </div>
      </div>
      
      {/* Marketing Stats */}
      <div className="marketing-stats">
        <h3>Platform Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <p className="stat-value">{marketingStats.totalUsers?.toLocaleString() || '10,000,000'}</p>
            <p className="stat-label">Total Users</p>
          </div>
          <div className="stat-item">
            <p className="stat-value">{marketingStats.dailyActiveUsers?.toLocaleString() || '1,000,000'}</p>
            <p className="stat-label">Daily Active</p>
          </div>
          <div className="stat-item">
            <p className="stat-value">₹{marketingStats.totalWithdrawn?.toLocaleString() || '10 Cr'}</p>
            <p className="stat-label">Total Withdrawn</p>
          </div>
          <div className="stat-item">
            <p className="stat-value">{marketingStats.successRate || '98.5'}%</p>
            <p className="stat-label">Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderProductPlans = () => (
    <div className="product-plans">
      <div className="header">
        <h2>Investment Plans</h2>
        <button onClick={() => setView('dashboard')}>Back to Dashboard</button>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <div className="plans-grid">
        {productPlans.map(plan => (
          <div key={plan.id} className="plan-card">
            <h3>{plan.name}</h3>
            <p className="plan-price">₹{plan.price}</p>
            <div className="plan-details">
              <p>Daily Income: ₹{plan.dailyIncome}</p>
              <p>Total Return: ₹{plan.totalReturn}</p>
              <p>Duration: {plan.durationDays} days</p>
            </div>
            <button 
              onClick={() => handlePurchasePlan(plan.id)}
              disabled={loading || (userData?.balance || 0) < plan.price}
            >
              {loading ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
  
  const renderWithdrawalForm = () => (
    <div className="withdrawal-form">
      <div className="header">
        <h2>Request Withdrawal</h2>
        <button onClick={() => setView('dashboard')}>Back to Dashboard</button>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <div className="wallet-balance">
        <p>Available Balance: ₹{userData?.balance || 0}</p>
      </div>
      
      <form onSubmit={handleWithdrawalRequest}>
        <div>
          <label>Amount (₹):</label>
          <input
            type="number"
            name="amount"
            value={withdrawalForm.amount}
            onChange={handleWithdrawalChange}
            min="100"
            max={userData?.balance || 0}
            required
          />
        </div>
        
        <div>
          <label>Method:</label>
          <select
            name="method"
            value={withdrawalForm.method}
            onChange={handleWithdrawalChange}
          >
            <option value="bank">Bank Transfer</option>
            <option value="upi">UPI</option>
          </select>
        </div>
        
        <div>
          <label>Details:</label>
          <textarea
            name="details"
            value={withdrawalForm.details}
            onChange={handleWithdrawalChange}
            placeholder="Bank account details or UPI ID"
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Request Withdrawal'}
        </button>
      </form>
      
      <div className="withdrawal-info">
        <p><strong>Note:</strong> Only one withdrawal allowed every 24 hours. 5% GST will be deducted.</p>
      </div>
    </div>
  );
  
  const renderRechargeForm = () => (
    <div className="recharge-form">
      <div className="header">
        <h2>Recharge Wallet</h2>
        <button onClick={() => setView('dashboard')}>Back to Dashboard</button>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <div className="upi-instructions">
        <h3>Pay via UPI</h3>
        <p>Scan the QR code or use the UPI ID below:</p>
        <button onClick={copyUPIId}>Copy UPI ID</button>
        <p className="upi-id">7047571829@upi</p>
        <div className="qr-placeholder">
          <p>QR Code Image</p>
          <p>(Image would be displayed here in production)</p>
        </div>
      </div>
      
      <form onSubmit={handleRechargeRequest}>
        <div>
          <label>Amount (₹):</label>
          <input
            type="number"
            name="amount"
            value={rechargeForm.amount}
            onChange={handleRechargeChange}
            min="100"
            required
          />
        </div>
        
        <div>
          <label>UTR Number:</label>
          <input
            type="text"
            name="utr"
            value={rechargeForm.utr}
            onChange={handleRechargeChange}
            placeholder="Enter UPI transaction reference"
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Submit Recharge Request'}
        </button>
      </form>
      
      <div className="recharge-info">
        <p><strong>Note:</strong> After payment, enter the UTR number for admin approval.</p>
      </div>
    </div>
  );
  
  const renderAdminPanel = () => (
    <div className="admin-panel">
      <div className="header">
        <h2>Admin Panel</h2>
        <div className="header-buttons">
          <button onClick={() => setView('dashboard')}>Back to Dashboard</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <div className="admin-tabs">
        <button 
          className={view === 'admin' ? 'active' : ''}
          onClick={() => {
            setView('admin');
            fetchPendingRecharges();
            fetchPendingWithdrawals();
          }}
        >
          Pending Requests
        </button>
        <button 
          className={view === 'admin-users' ? 'active' : ''}
          onClick={() => setView('admin-users')}
        >
          User Management
        </button>
      </div>
      
      {/* Pending Requests Tab */}
      {view === 'admin' && (
        <div className="admin-pending-requests">
          <h3>Pending Recharges</h3>
          <div className="requests-list">
            {pendingRecharges.length > 0 ? (
              pendingRecharges.map(recharge => (
                <div key={recharge.id} className="request-item">
                  <p><strong>User ID:</strong> {recharge.user_id}</p>
                  <p><strong>Amount:</strong> ₹{recharge.amount}</p>
                  <p><strong>UTR:</strong> {recharge.utr}</p>
                  <p><strong>Date:</strong> {new Date(recharge.request_date).toLocaleString()}</p>
                  <div className="request-actions">
                    <button 
                      onClick={() => handleApproveRecharge(recharge.id)}
                      className="approve-btn"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRejectRecharge(recharge.id)}
                      className="reject-btn"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No pending recharges</p>
            )}
          </div>
          
          <h3>Pending Withdrawals</h3>
          <div className="requests-list">
            {pendingWithdrawals.length > 0 ? (
              pendingWithdrawals.map(withdrawal => (
                <div key={withdrawal.id} className="request-item">
                  <p><strong>User ID:</strong> {withdrawal.user_id}</p>
                  <p><strong>Amount:</strong> ₹{withdrawal.amount}</p>
                  <p><strong>Method:</strong> {withdrawal.method}</p>
                  <p><strong>Details:</strong> {withdrawal.details}</p>
                  <p><strong>Date:</strong> {new Date(withdrawal.request_date).toLocaleString()}</p>
                  <div className="request-actions">
                    <button 
                      onClick={() => handleApproveWithdrawal(withdrawal.id)}
                      className="approve-btn"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRejectWithdrawal(withdrawal.id)}
                      className="reject-btn"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No pending withdrawals</p>
            )}
          </div>
        </div>
      )}
      
      {/* User Management Tab */}
      {view === 'admin-users' && (
        <div className="admin-user-management">
          <h3>Search Users</h3>
          <div className="search-form">
            <input
              type="text"
              value={adminUserSearch}
              onChange={(e) => setAdminUserSearch(e.target.value)}
              placeholder="Search by name, email, or mobile"
            />
            <button onClick={handleSearchUsers}>Search</button>
          </div>
          
          {adminUserResults.length > 0 && (
            <div className="search-results">
              <h4>Search Results</h4>
              {adminUserResults.map(user => (
                <div key={user.id} className="user-result">
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Mobile:</strong> {user.mobile}</p>
                  <p><strong>Balance:</strong> ₹{user.balance}</p>
                  <button onClick={() => handleSelectUser(user)}>Select User</button>
                </div>
              ))}
            </div>
          )}
          
          {selectedUser && (
            <div className="user-details">
              <h4>Selected User: {selectedUser.name}</h4>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Mobile:</strong> {selectedUser.mobile}</p>
              <p><strong>Balance:</strong> ₹{selectedUser.balance}</p>
              
              <h4>Adjust Balance</h4>
              <form onSubmit={handleAdjustBalance}>
                <div>
                  <label>Amount (₹):</label>
                  <input
                    type="number"
                    name="amount"
                    value={adjustBalanceForm.amount}
                    onChange={(e) => setAdjustBalanceForm({...adjustBalanceForm, amount: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label>Reason:</label>
                  <textarea
                    name="reason"
                    value={adjustBalanceForm.reason}
                    onChange={(e) => setAdjustBalanceForm({...adjustBalanceForm, reason: e.target.value})}
                    required
                  />
                </div>
                <button type="submit">Adjust Balance</button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
  
  // Render the appropriate view
  return (
    <div className="App">
      <header className="App-header">
        <h1>Investment Platform</h1>
      </header>
      
      {/* Fake Withdrawal Popup */}
      {showFakeWithdrawal && fakeWithdrawal && (
        <div className="fake-withdrawal-popup">
          <div className="popup-content">
            <p><strong>New Withdrawal!</strong></p>
            <p>{fakeWithdrawal.name}</p>
            <p>₹{fakeWithdrawal.amount.toLocaleString()}</p>
            <p>{fakeWithdrawal.timestamp}</p>
          </div>
        </div>
      )}
      
      <main>
        {!token ? (
          // Non-authenticated views
          <>
            {view === 'login' && renderLoginForm()}
            {view === 'register' && renderRegisterForm()}
            
            {/* Marketing section for non-logged in users */}
            <div className="marketing-section">
              <div className="marketing-stats">
                <h2>Platform Statistics</h2>
                <div className="stats-grid">
                  <div className="stat-item">
                    <p className="stat-value">{marketingStats.totalUsers?.toLocaleString() || '10,000,000'}</p>
                    <p className="stat-label">Total Users</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-value">{marketingStats.dailyActiveUsers?.toLocaleString() || '1,000,000'}</p>
                    <p className="stat-label">Daily Active</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-value">₹{marketingStats.totalWithdrawn?.toLocaleString() || '10 Cr'}</p>
                    <p className="stat-label">Total Withdrawn</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-value">{marketingStats.successRate || '98.5'}%</p>
                    <p className="stat-label">Success Rate</p>
                  </div>
                </div>
              </div>
              
              <div className="anniversary-badge">
                <h3>5 YEARS ANNIVERSARY ACHIEVEMENT</h3>
              </div>
            </div>
          </>
        ) : (
          // Authenticated views
          <>
            {view === 'dashboard' && renderDashboard()}
            {view === 'plans' && renderProductPlans()}
            {view === 'withdraw' && renderWithdrawalForm()}
            {view === 'recharge' && renderRechargeForm()}
            {(view === 'admin' || view === 'admin-users') && renderAdminPanel()}
          </>
        )}
      </main>
    </div>
  );
}

export default App;