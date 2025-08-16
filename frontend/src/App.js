import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

// Import components
import UserDashboard from './components/UserDashboard';
import InvestmentPlans from './components/InvestmentPlans';
import WithdrawalForm from './components/WithdrawalForm';
import RechargeForm from './components/RechargeForm';
import Referral from './components/Referral';
import MarketingStats from './components/MarketingStats';
import FakeWithdrawalPopup from './components/FakeWithdrawalPopup';

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
    }
    
    // Start fake withdrawal timer for all users
    startFakeWithdrawalTimer();
    
    // Cleanup timer on unmount
    return () => {
      if (fakeWithdrawalTimer.current) {
        clearInterval(fakeWithdrawalTimer.current);
      }
    };
  }, []);

  // Handle fake withdrawal popups
  const startFakeWithdrawalTimer = () => {
    // Clear existing timer if any
    if (fakeWithdrawalTimer.current) {
      clearInterval(fakeWithdrawalTimer.current);
    }
    
    // Start new timer (every 10 seconds)
    fakeWithdrawalTimer.current = setInterval(() => {
      // This will be handled by the FakeWithdrawalPopup component
    }, 10000); // Every 10 seconds
  };

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

  const handleViewChange = (newView) => {
    setView(newView);
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

  return (
    <div className="App">
      <header className="App-header">
        <h1>Investment Platform</h1>
      </header>
      
      {/* Show fake withdrawal popup for all users */}
      <FakeWithdrawalPopup />
      
      <main>
        {!token ? (
          // Non-authenticated views
          <>
            {view === 'login' && renderLoginForm()}
            {view === 'register' && renderRegisterForm()}
            
            {/* Marketing section for non-logged in users */}
            <div className="marketing-section">
              <MarketingStats />
            </div>
          </>
        ) : (
          // Authenticated views
          <>
            {view === 'dashboard' && (
              <UserDashboard 
                token={token} 
                userData={userData} 
                onLogout={handleLogout} 
                onViewChange={handleViewChange}
              />
            )}
            {view === 'plans' && (
              <InvestmentPlans 
                token={token} 
                userData={userData} 
                onPlanPurchase={(newBalance) => {
                  setUserData({...userData, balance: newBalance});
                }}
              />
            )}
            {view === 'withdraw' && (
              <WithdrawalForm 
                token={token} 
                userData={userData}
                onWithdrawalRequest={(newBalance) => {
                  setUserData({...userData, balance: newBalance});
                }}
              />
            )}
            {view === 'recharge' && (
              <RechargeForm 
                token={token} 
                userData={userData}
                onRechargeRequest={() => {
                  // Refresh user data if needed
                  fetchUserData(token);
                }}
              />
            )}
            {view === 'referral' && (
              <Referral 
                token={token} 
                userData={userData}
                onBack={() => setView('dashboard')}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;