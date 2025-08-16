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

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);

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
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchDashboardData();
    }
  }, [token, fetchDashboardData]);

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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="header">
        <h2>Welcome, {userData?.name || 'User'}!</h2>
        <button onClick={onLogout}>✕</button>
      </div>

      {/* Wallet Summary */}
      <div className="wallet-summary">
        <div className="summary-card">
          <div className="summary-label">Current Balance</div>
          <div className="summary-value">{formatCurrency(userData?.balance || 0)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Invested</div>
          <div className="summary-value">{formatCurrency(totalInvested)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">Total Withdrawn</div>
          <div className="summary-value">{formatCurrency(totalWithdrawn)}</div>
        </div>
      </div>

      {/* My Products */}
      <h3 className="section-title">
        <i>📊</i> My Products
      </h3>
      <div className="products-grid">
        {loading ? (
          <p>Loading investments...</p>
        ) : investments.length === 0 ? (
          <div className="summary-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <p>No active products.</p>
            <button className="action-button" onClick={() => onViewChange('plans')}>
              Buy a Plan
            </button>
          </div>
        ) : (
          investments.map(investment => {
            // Calculate days left
            const purchaseDate = new Date(investment.purchase_date);
            const endDate = new Date(purchaseDate);
            endDate.setDate(endDate.getDate() + (investment.duration_days || 30));
            const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
            
            // Calculate progress percentage
            const totalDuration = investment.duration_days || 30;
            const elapsedDays = totalDuration - (daysLeft > 0 ? daysLeft : 0);
            const progressPercentage = (elapsedDays / totalDuration) * 100;
            
            return (
              <div key={investment.id} className="product-card">
                <h4>{investment.plan_name}</h4>
                <div className="product-info">
                  <span>Days Left</span>
                  <span>{daysLeft > 0 ? daysLeft : 0}</span>
                </div>
                <div className="product-info">
                  <span>Daily Income</span>
                  <span>{formatCurrency(investment.daily_income || 0)}</span>
                </div>
                <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${progressPercentage > 100 ? 100 : progressPercentage}%` }}
                  ></div>
                </div>
                <div className="status-badge active">Active</div>
              </div>
            );
          })
        )}
      </div>

      {/* Transactions */}
      <h3 className="section-title">
        <i>📋</i> Recent Transactions
      </h3>
      <div className="transactions-list">
        {loading ? (
          <p>Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p>No transactions yet.</p>
        ) : (
          transactions.map(transaction => (
            <div key={transaction.id} className="transaction-item">
              <div className={`transaction-icon icon-${transaction.type}`}>
                {transaction.type === 'recharge' ? '💰' : transaction.type === 'withdrawal' ? '📤' : '📈'}
              </div>
              <div className="transaction-details">
                <div className="transaction-type">
                  {transaction.type === 'recharge' ? 'Recharge' : 
                   transaction.type === 'withdrawal' ? 'Withdrawal' : 'Daily Income'}
                </div>
                <div className="transaction-amount">
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
              <div className="transaction-details">
                <div className={`transaction-status status-${transaction.status}`}>
                  {transaction.status}
                </div>
                <div className="transaction-date">
                  {new Date(transaction.request_date || transaction.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="action-button" onClick={() => onViewChange('plans')}>
          <i>📋</i>
          <span>Products</span>
        </div>
        <div className="action-button" onClick={() => onViewChange('recharge')}>
          <i>💳</i>
          <span>Recharge</span>
        </div>
        <div className="action-button" onClick={() => onViewChange('withdraw')}>
          <i>💸</i>
          <span>Withdraw</span>
        </div>
        <div className="action-button" onClick={copyReferralLink}>
          <i>🔗</i>
          <span>Refer</span>
        </div>
        {userData?.is_admin && (
          <div className="action-button" onClick={() => onViewChange('admin')}>
            <i>🔒</i>
            <span>Admin</span>
          </div>
        )}
      </div>

      {/* Trust Badges */}
      <div className="trust-section">
        <div className="trust-title">Trusted By</div>
        <div className="trust-logos">
          <div className="trust-badge">
            <i>🏢</i>
            <span>RBI Registered</span>
          </div>
          <div className="trust-badge">
            <i>📜</i>
            <span>ISO Certified</span>
          </div>
          <div className="trust-badge">
            <i>🏦</i>
            <span>World Bank Approved</span>
          </div>
          <div className="trust-badge">
            <i>🛡️</i>
            <span>Govt Verified</span>
          </div>
          <div className="trust-badge">
            <i>👥</i>
            <span>10M+ Users</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-item active">
          <i>🏠</i>
          <span>Home</span>
        </button>
        <button className="nav-item" onClick={() => onViewChange('plans')}>
          <i>📋</i>
          <span>Products</span>
        </button>
        <button className="nav-item" onClick={() => onViewChange('recharge')}>
          <i>💰</i>
          <span>Wallet</span>
        </button>
        <button className="nav-item" onClick={copyReferralLink}>
          <i>👤</i>
          <span>Profile</span>
        </button>
      </div>

      {/* Floating Action Button */}
      <button className="fab" onClick={() => onViewChange('recharge')}>
        +
      </button>
    </div>
  );
}

export default UserDashboard;