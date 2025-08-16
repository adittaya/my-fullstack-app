import React, { useState, useEffect, useCallback } from 'react';
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
  const [investments, setInvestments] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, fetchDashboardData]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch investments
      const investmentsRes = await axios.get(`${API_BASE_URL}/api/investments`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Fetch transactions (recharges and withdrawals)
      const rechargesRes = await axios.get(`${API_BASE_URL}/api/recharges`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const withdrawalsRes = await axios.get(`${API_BASE_URL}/api/withdrawals`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setInvestments(investmentsRes.data.investments || []);

      // Combine transactions and sort by date
      const allTransactions = [
        ...(rechargesRes.data.recharges || []).map(t => ({ ...t, type: 'recharge' })),
        ...(withdrawalsRes.data.withdrawals || []).map(t => ({ ...t, type: 'withdrawal' }))
      ].sort((a, b) => new Date(b.request_date || b.created_at) - new Date(a.request_date || a.created_at));

      setTransactions(allTransactions.slice(0, 10)); // Show only last 10 transactions
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const copyReferralLink = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/referral-link`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      navigator.clipboard.writeText(response.data.referralLink);
      alert('Referral link copied to clipboard!');
    } catch (err) {
      alert('Failed to copy referral link');
    }
  };

  // Calculate total invested
  const totalInvested = investments.reduce((sum, investment) => sum + investment.amount, 0);

  // Calculate total withdrawn
  const totalWithdrawn = transactions
    .filter(t => t.type === 'withdrawal' && t.status === 'approved')
    .reduce((sum, withdrawal) => sum + withdrawal.amount, 0);

  return (
    <div className="user-dashboard">
      <div className="header">
        <h2>Welcome, {userData?.name || 'User'}!</h2>
        <button onClick={onLogout}>Logout</button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {/* Wallet Summary */}
      <div className="wallet-summary">
        <h3>Wallet Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <p className="summary-label">Current Balance</p>
            <p className="summary-value">₹{userData?.balance || 0}</p>
          </div>
          <div className="summary-item">
            <p className="summary-label">Total Invested</p>
            <p className="summary-value">₹{totalInvested}</p>
          </div>
          <div className="summary-item">
            <p className="summary-label">Total Withdrawn</p>
            <p className="summary-value">₹{totalWithdrawn}</p>
          </div>
          <div className="summary-item">
            <p className="summary-label">Share Link</p>
            <button onClick={copyReferralLink} className="copy-link-btn">Copy Referral Link</button>
          </div>
        </div>
      </div>
      
      {/* My Products */}
      <div className="my-products">
        <h3>My Products</h3>
        {loading ? (
          <p>Loading investments...</p>
        ) : investments.length === 0 ? (
          <p>No active products. <button onClick={() => onViewChange('plans')}>Buy a plan</button></p>
        ) : (
          <div className="products-grid">
            {investments.map(investment => {
              // Calculate days left
              const purchaseDate = new Date(investment.purchase_date);
              const endDate = new Date(purchaseDate);
              endDate.setDate(endDate.getDate() + 30); // Assuming 30-day duration
              const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={investment.id} className="product-card">
                  <h4>{investment.plan_name}</h4>
                  <p>Days Left: {daysLeft > 0 ? daysLeft : 0}</p>
                  <p>Daily Income: ₹{investment.daily_income || 0}</p>
                  <p>Status: <span className={`status ${investment.status}`}>{investment.status}</span></p>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Transactions */}
      <div className="transactions">
        <h3>Recent Transactions</h3>
        {loading ? (
          <p>Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          <div className="transactions-list">
            {transactions.map(transaction => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-info">
                  <p className="transaction-type">{transaction.type === 'recharge' ? 'Recharge' : 'Withdrawal'}</p>
                  <p className="transaction-amount">₹{transaction.amount}</p>
                </div>
                <div className="transaction-details">
                  <p className="transaction-status">{transaction.status}</p>
                  <p className="transaction-date">
                    {new Date(transaction.request_date || transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => onViewChange('plans')}>View Plans</button>
        <button onClick={() => onViewChange('withdraw')}>Withdraw</button>
        <button onClick={() => onViewChange('recharge')}>Recharge</button>
        <button onClick={copyReferralLink}>Share Referral</button>
      </div>
      
      {/* Trust Elements */}
      <div className="trust-elements">
        <div className="trust-logos">
          <span className="trust-badge">RBI Registered</span>
          <span className="trust-badge">World Bank Approved</span>
          <span className="trust-badge">ISO Certified</span>
          <span className="trust-badge">10M+ users</span>
          <span className="trust-badge">₹10 Crore Withdrawn</span>
          <span className="trust-badge">Government Verified Seal</span>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;