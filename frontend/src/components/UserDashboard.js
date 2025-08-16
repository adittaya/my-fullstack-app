import React, { useState, useEffect } from 'react';
import axios from 'axios';

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

function UserDashboard({ token, userData, onLogout, onViewChange }) {
  const [userInvestments, setUserInvestments] = useState([]);
  const [userWithdrawals, setUserWithdrawals] = useState([]);
  const [userRecharges, setUserRecharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (token) {
      fetchUserInvestments();
      fetchUserWithdrawals();
      fetchUserRecharges();
    }
  }, [token]);

  const fetchUserInvestments = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.get(`${API_BASE_URL}/api/investments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUserInvestments(response.data.investments);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch investments');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserWithdrawals = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.get(`${API_BASE_URL}/api/withdrawals`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUserWithdrawals(response.data.withdrawals);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch withdrawals');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRecharges = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.get(`${API_BASE_URL}/api/recharges`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUserRecharges(response.data.recharges);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch recharges');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // In a real app, you would call a refresh endpoint here
      // For now, we'll just refetch the data
      await Promise.all([
        fetchUserInvestments(),
        fetchUserWithdrawals(),
        fetchUserRecharges()
      ]);
      setSuccess('Data refreshed successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {userData?.name || 'User'}!</h2>
        <div className="header-actions">
          <button onClick={handleRefreshData} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
          <button onClick={onLogout}>Logout</button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {/* User Info */}
      <div className="user-info">
        <h3>User Information</h3>
        <p><strong>Email:</strong> {userData?.email || 'Not provided'}</p>
        <p><strong>Mobile:</strong> {userData?.mobile || 'Not provided'}</p>
        <p><strong>Wallet Balance:</strong> ₹{userData?.balance || 0}</p>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => onViewChange('plans')}>View Plans</button>
        <button onClick={() => onViewChange('withdraw')}>Withdraw</button>
        <button onClick={() => onViewChange('recharge')}>Recharge</button>
        <button onClick={() => onViewChange('referral')}>Share Referral</button>
      </div>

      {/* Investments Summary */}
      <div className="investments-summary">
        <h3>Your Investments</h3>
        <p><strong>Total Investments:</strong> ₹{(userInvestments.reduce((sum, inv) => sum + inv.amount, 0)).toFixed(2)}</p>
        <p><strong>Active Plans:</strong> {userInvestments.filter(inv => inv.status === 'active').length}</p>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-item">
          <p><strong>Last Login:</strong> Just now</p>
        </div>
      </div>

      {/* Marketing Stats */}
      <div className="marketing-stats">
        <h3>Platform Statistics</h3>
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

      {/* Anniversary Badge */}
      <div className="anniversary-badge">
        <h3>5 YEARS ANNIVERSARY ACHIEVEMENT</h3>
      </div>
    </div>
  );
}

export default UserDashboard;