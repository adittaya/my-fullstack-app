import React, { useState } from 'react';
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

function WithdrawalForm({ token, userData, onWithdrawalRequest, onBack }) {
  const [formData, setFormData] = useState({
    amount: '',
    method: 'bank', // 'bank' or 'upi'
    details: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/withdraw`, 
        formData, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccess('Withdrawal request submitted successfully!');
      // Reset form
      setFormData({
        amount: '',
        method: 'bank',
        details: ''
      });
      // Call the parent function to update user data
      if (onWithdrawalRequest) {
        onWithdrawalRequest(response.data.newBalance);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit withdrawal request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="withdrawal-form">
      <div className="header">
        <h2>Request Withdrawal</h2>
        <button onClick={onBack}>Back to Dashboard</button>
      </div>
      
      <div className="wallet-balance">
        <p>Available Balance: ₹{userData?.balance || 0}</p>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Amount (₹):</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="100"
            max={userData?.balance || 0}
            required
          />
        </div>
        
        <div>
          <label>Method:</label>
          <select
            name="method"
            value={formData.method}
            onChange={handleChange}
          >
            <option value="bank">Bank Transfer</option>
            <option value="upi">UPI</option>
          </select>
        </div>
        
        <div>
          <label>Details:</label>
          <textarea
            name="details"
            value={formData.details}
            onChange={handleChange}
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
}

export default WithdrawalForm;