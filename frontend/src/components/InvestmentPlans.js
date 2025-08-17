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

function InvestmentPlans({ token, onPlanPurchase, userData, onBack }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedPlan, setExpandedPlan] = useState(null);

  const fetchProductPlans = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.get(`${API_BASE_URL}/api/product-plans`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPlans(response.data.plans);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch product plans');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProductPlans();
  }, [fetchProductPlans]);

  const handlePurchasePlan = async (planId) => {
    setLoading(true);
    setError('');
    setSuccess('');

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
      // Call the parent function to update user data
      if (onPlanPurchase) {
        onPlanPurchase(response.data.newBalance);
      }
      
      // Refresh plans to update availability
      fetchProductPlans();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to purchase plan');
    } finally {
      setLoading(false);
    }
  };

  const togglePlanDetails = (planId) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="investment-plans">
      {/* Header */}
      <div className="header">
        <h2>Investment Plans</h2>
        <button onClick={onBack}>✕</button>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading plans...</div>
      ) : (
        <div className="plan-cards">
          {plans.map(plan => (
            <div 
              key={plan.id} 
              className={`plan-card ${expandedPlan === plan.id ? 'expanded' : ''}`}
              onClick={() => togglePlanDetails(plan.id)}
            >
              <div className="plan-header">
                <div className="plan-name">{plan.name}</div>
                <div className="plan-category">{plan.category}</div>
              </div>
              <div className="plan-price">{formatCurrency(plan.price)}</div>
              
              <div className="plan-detail">
                <i>📂</i>
                <span>Category: </span>
                <span className="plan-detail-value">{plan.category}</span>
              </div>
              
              <div className="plan-detail">
                <i>💰</i>
                <span>Price: </span>
                <span className="plan-detail-value">{formatCurrency(plan.price)}</span>
              </div>
              
              <div className="plan-detail">
                <i>💸</i>
                <span>Daily Income: </span>
                <span className="plan-detail-value">{formatCurrency(plan.dailyIncome)}</span>
              </div>
              
              <div className="plan-detail">
                <i>📅</i>
                <span>Duration: </span>
                <span className="plan-detail-value">{plan.durationDays} days</span>
              </div>
              
              <div className="plan-detail">
                <i>📈</i>
                <span>Total Return: </span>
                <span className="plan-detail-value">{formatCurrency(plan.totalReturn)}</span>
              </div>
              
              <div className="plan-detail">
                <i>📊</i>
                <span>Profit: </span>
                <span className="plan-detail-value">{formatCurrency(plan.totalReturn - plan.price)}</span>
              </div>
              
              <button 
                className="buy-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePurchasePlan(plan.id);
                }}
                disabled={loading || (userData?.balance || 0) < plan.price}
              >
                {loading ? 'Processing...' : 
                 (userData?.balance || 0) < plan.price ? 'Insufficient Balance' : 'Buy Now'}
              </button>
              
              {(userData?.balance || 0) < plan.price && (
                <div className="insufficient-balance">Insufficient balance</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-item" onClick={onBack}>
          <i>🏠</i>
          <span>Home</span>
        </button>
        <button className="nav-item active">
          <i>📋</i>
          <span>Products</span>
        </button>
        <button className="nav-item" onClick={() => window.location.reload()}>
          <i>💰</i>
          <span>Wallet</span>
        </button>
        <button className="nav-item" onClick={() => alert('Profile clicked')}>
          <i>👤</i>
          <span>Profile</span>
        </button>
      </div>
    </div>
  );
}

export default InvestmentPlans;