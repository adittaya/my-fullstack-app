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
    bankName: '',
    ifscCode: '',
    accountNumber: '',
    accountHolderName: '',
    upiId: ''
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

    // Validate form based on selected method
    if (formData.method === 'bank') {
      if (!formData.bankName || !formData.ifscCode || !formData.accountNumber || !formData.accountHolderName) {
        setError('Please fill in all bank details');
        setLoading(false);
        return;
      }
      // Format bank details
      formData.details = `Bank: ${formData.bankName}, IFSC: ${formData.ifscCode}, Account: ${formData.accountNumber}, Holder: ${formData.accountHolderName}`;
    } else {
      if (!formData.upiId) {
        setError('Please enter UPI ID');
        setLoading(false);
        return;
      }
      formData.details = `UPI: ${formData.upiId}`;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/withdraw`, 
        {
          amount: parseFloat(formData.amount),
          method: formData.method,
          details: formData.details
        },
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
        bankName: '',
        ifscCode: '',
        accountNumber: '',
        accountHolderName: '',
        upiId: ''
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="withdrawal-form">
      {/* Header */}
      <div className="header">
        <h2>Request Withdrawal</h2>
        <button onClick={onBack}>✕</button>
      </div>
      
      <div className="wallet-balance">
        <p>Available Balance: {formatCurrency(userData?.balance || 0)}</p>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Amount (₹)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="100"
            max={userData?.balance || 0}
            placeholder="Minimum ₹100"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Method</label>
          <select
            name="method"
            value={formData.method}
            onChange={handleChange}
          >
            <option value="bank">Bank Transfer</option>
            <option value="upi">UPI</option>
          </select>
        </div>
        
        {formData.method === 'bank' ? (
          <>
            <div className="form-group">
              <label>Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="Enter bank name"
                required
              />
            </div>
            <div className="form-group">
              <label>IFSC Code</label>
              <input
                type="text"
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                placeholder="Enter IFSC code"
                required
              />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                placeholder="Enter account number"
                required
              />
            </div>
            <div className="form-group">
              <label>Account Holder Name</label>
              <input
                type="text"
                name="accountHolderName"
                value={formData.accountHolderName}
                onChange={handleChange}
                placeholder="Enter account holder name"
                required
              />
            </div>
          </>
        ) : (
          <div className="form-group">
            <label>UPI ID</label>
            <input
              type="text"
              name="upiId"
              value={formData.upiId}
              onChange={handleChange}
              placeholder="Enter UPI ID"
              required
            />
          </div>
        )}
        
        <button type="submit" className="withdraw-button" disabled={loading}>
          {loading ? 'Processing...' : 'Withdraw Now'}
        </button>
      </form>
      
      <div className="recharge-info">
        <p><strong>Note:</strong> Only one withdrawal allowed every 24 hours. 18% GST will be deducted.</p>
        <p><strong>Minimum withdrawal amount:</strong> ₹100</p>
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-item" onClick={onBack}>
          <i>🏠</i>
          <span>Home</span>
        </button>
        <button className="nav-item" onClick={() => alert('Products clicked')}>
          <i>📋</i>
          <span>Products</span>
        </button>
        <button className="nav-item active">
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

export default WithdrawalForm;