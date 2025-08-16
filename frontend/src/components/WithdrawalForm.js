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
  const [withdrawableBalance, setWithdrawableBalance] = useState(0);
  const [loadingBalance, setLoadingBalance] = useState(true);

  // Fetch withdrawable balance when component mounts
  useEffect(() => {
    const fetchWithdrawableBalance = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/financial-summary`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setWithdrawableBalance(response.data.withdrawableBalance || 0);
      } catch (err) {
        console.error('Failed to fetch withdrawable balance:', err);
        setError('Failed to fetch withdrawable balance');
      } finally {
        setLoadingBalance(false);
      }
    };

    if (token) {
      fetchWithdrawableBalance();
    }
  }, [token]);

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

    // Validate amount
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      setLoading(false);
      return;
    }

    // Validate against withdrawable balance
    if (amount > withdrawableBalance) {
      setError(`Amount exceeds withdrawable balance. Maximum withdrawable amount: ₹${withdrawableBalance.toFixed(2)}`);
      setLoading(false);
      return;
    }

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
      formData.details = `UPI ID: ${formData.upiId}`;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/withdraw`, 
        {
          amount: amount,
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
      setFormData({
        amount: '',
        method: 'bank',
        bankName: '',
        ifscCode: '',
        accountNumber: '',
        accountHolderName: '',
        upiId: ''
      });

      // Refresh withdrawable balance
      const financialResponse = await axios.get(`${API_BASE_URL}/api/financial-summary`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setWithdrawableBalance(financialResponse.data.withdrawableBalance || 0);

      // Call parent function to update user data
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
        {loadingBalance ? (
          <p>Withdrawable Balance: Loading...</p>
        ) : (
          <p>Withdrawable Balance: {formatCurrency(withdrawableBalance)}</p>
        )}
        <p className="note">Note: You can only withdraw from your profit earnings</p>
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
            min="1"
            max={withdrawableBalance}
            step="1"
            placeholder={`Max: ₹${withdrawableBalance.toFixed(2)}`}
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