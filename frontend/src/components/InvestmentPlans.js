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

function InvestmentPlans({ token, onPlanPurchase, userData, onBack }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProductPlans();
  }, [fetchProductPlans]);

  const fetchProductPlans = async () => {
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
  };

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
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to purchase plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="investment-plans">
      <div className="header">
        <h2>Investment Plans</h2>
        <button onClick={onBack}>Back to Dashboard</button>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {loading ? (
        <div>Loading plans...</div>
      ) : (
        <div className="plans-grid">
          {plans.map(plan => (
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
              {(userData?.balance || 0) < plan.price && (
                <p className="insufficient-balance">Insufficient balance</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default InvestmentPlans;