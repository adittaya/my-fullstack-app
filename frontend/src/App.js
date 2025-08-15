import React, { useState, useEffect } from 'react';
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
  const [view, setView] = useState('login'); // 'login', 'register', 'dashboard'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: ''
  });
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
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
        <button type="submit">Login</button>
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
        <button type="submit">Register</button>
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
        <button onClick={handleLogout}>Logout</button>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <div className="user-info">
        <h3>User Information</h3>
        <p><strong>Email:</strong> {userData?.email || user?.email}</p>
        <p><strong>Mobile:</strong> {userData?.mobile || 'Not provided'}</p>
        <p><strong>Balance:</strong> ₹{userData?.balance || 0}</p>
      </div>
      
      <div className="actions">
        <button onClick={() => fetchUserData(token)}>Refresh Data</button>
      </div>
    </div>
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>Investment Platform</h1>
      </header>
      <main>
        {view === 'login' && renderLoginForm()}
        {view === 'register' && renderRegisterForm()}
        {view === 'dashboard' && renderDashboard()}
      </main>
    </div>
  );
}

export default App;