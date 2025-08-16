import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import UserDashboard from './components/UserDashboard';
import InvestmentPlans from './components/InvestmentPlans';
import WithdrawalForm from './components/WithdrawalForm';
import RechargeForm from './components/RechargeForm';
import Referral from './components/Referral';

function App() {
  const [, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [view, setView] = useState('login'); // 'login', 'register', 'dashboard', 'plans', 'withdraw', 'recharge', 'referral'
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

  // Check if user is already logged in
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setView('dashboard');
      fetchUserData(savedToken);
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await axios.post('/api/register', formData);
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
      const response = await axios.post('/api/login', {
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
      const response = await axios.get('/api/data', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      setUserData(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch user data');
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
  };

  const handleViewChange = (newView) => {
    setView(newView);
    // Clear any previous error/success messages when switching views
    setError('');
    setSuccess('');
  };

  const handlePlanPurchase = (newBalance) => {
    // Update user balance after plan purchase
    if (userData) {
      setUserData({
        ...userData,
        balance: newBalance
      });
    }
    setSuccess('Plan purchased successfully!');
  };

  const handleWithdrawalRequest = (newBalance) => {
    // Update user balance after withdrawal request
    if (userData) {
      setUserData({
        ...userData,
        balance: newBalance
      });
    }
    setSuccess('Withdrawal request submitted successfully!');
  };

  const handleRechargeRequest = () => {
    setSuccess('Recharge request submitted successfully! Waiting for admin approval.');
  };

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
    <UserDashboard 
      token={token} 
      userData={userData} 
      onLogout={handleLogout} 
      onViewChange={handleViewChange} 
    />
  );

  const renderInvestmentPlans = () => (
    <InvestmentPlans 
      token={token} 
      userData={userData} 
      onPlanPurchase={handlePlanPurchase}
    />
  );

  const renderWithdrawalForm = () => (
    <WithdrawalForm 
      token={token} 
      userData={userData} 
      onWithdrawalRequest={handleWithdrawalRequest}
    />
  );

  const renderRechargeForm = () => (
    <RechargeForm 
      token={token} 
      userData={userData} 
      onRechargeRequest={handleRechargeRequest}
    />
  );

  const renderReferral = () => (
    <Referral 
      token={token} 
      userData={userData} 
    />
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>Investment Platform</h1>
      </header>
      
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
                    <p className="stat-value">10,000,000</p>
                    <p className="stat-label">Total Users</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-value">1,000,000</p>
                    <p className="stat-label">Daily Active</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-value">₹10 Crore</p>
                    <p className="stat-label">Total Withdrawn</p>
                  </div>
                  <div className="stat-item">
                    <p className="stat-value">98.5%</p>
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
            {view === 'plans' && renderInvestmentPlans()}
            {view === 'withdraw' && renderWithdrawalForm()}
            {view === 'recharge' && renderRechargeForm()}
            {view === 'referral' && renderReferral()}
          </>
        )}
      </main>
    </div>
  );
}

export default App;