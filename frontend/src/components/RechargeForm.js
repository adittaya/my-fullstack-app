import React, { useState } from 'react';
import axios from 'axios';
import qrCodeImage from '../assets/qr-code.png';

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

function RechargeForm({ token, userData, onRechargeRequest, onBack }) {
  const [amount, setAmount] = useState('');
  const [utr, setUtr] = useState('');
  const [step, setStep] = useState('amount'); // 'amount', 'qr', 'utr'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAmountChange = (value) => {
    if (value === 'backspace') {
      setAmount(prev => prev.slice(0, -1));
    } else if (value === 'clear') {
      setAmount('');
    } else {
      setAmount(prev => prev + value);
    }
  };

  const handleNext = () => {
    if (amount && parseFloat(amount) >= 100) {
      setStep('qr');
    } else {
      setError('Minimum recharge amount is ₹100');
    }
  };

  const copyUPIId = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/upi-id`);
      navigator.clipboard.writeText(res.data.upiId);
      setSuccess('UPI ID copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to copy UPI ID');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post(`${API_BASE_URL}/api/recharge`, 
        {
          amount: parseFloat(amount),
          utr: utr
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccess('Recharge request submitted successfully! Waiting for admin approval.');
      // Reset form
      setAmount('');
      setUtr('');
      setStep('amount');
      // Call the parent function to update user data if needed
      if (onRechargeRequest) {
        onRechargeRequest();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit recharge request');
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
    <div className="recharge-form">
      {/* Header */}
      <div className="header">
        <h2>Recharge Wallet</h2>
        <button onClick={onBack}>✕</button>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      {step === 'amount' && (
        <div>
          <div className="amount-display">
            {formatCurrency(amount || 0)}
          </div>
          
          <div className="keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'backspace'].map(key => (
              <button
                key={key}
                className="keypad-button"
                onClick={() => handleAmountChange(key === 'backspace' ? 'backspace' : key.toString())}
              >
                {key === 'backspace' ? '⌫' : key}
              </button>
            ))}
            <button className="keypad-button action" onClick={() => handleAmountChange('clear')}>
              Clear
            </button>
            <button className="keypad-button action" onClick={handleNext}>
              Next
            </button>
          </div>
        </div>
      )}
      
      {step === 'qr' && (
        <div>
          <div className="amount-display">
            {formatCurrency(amount || 0)}
          </div>
          
          <div className="qr-container">
            <img src={qrCodeImage} alt="UPI Payment QR Code" className="qr-code" />
            <div className="upi-id">7047571829@upi</div>
            <button className="copy-button" onClick={copyUPIId}>
              Copy UPI ID
            </button>
          </div>
          
          <button className="submit-button" onClick={() => setStep('utr')}>
            Enter UTR
          </button>
          
          <button className="copy-button" onClick={() => setStep('amount')} style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
            Back
          </button>
        </div>
      )}
      
      {step === 'utr' && (
        <div className="utr-form">
          <div className="form-group">
            <label>Amount to Pay</label>
            <div className="amount-display" style={{ fontSize: '1.5rem', margin: '10px 0' }}>
              {formatCurrency(amount || 0)}
            </div>
          </div>
          
          <div className="form-group">
            <label>UTR Number</label>
            <input
              type="text"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              placeholder="Enter UPI transaction reference"
              required
            />
          </div>
          
          <button className="submit-button" onClick={handleSubmit} disabled={loading || !utr}>
            {loading ? 'Processing...' : 'Submit Recharge'}
          </button>
          
          <button className="copy-button" onClick={() => setStep('qr')} style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
            Back
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <a href="#" className="nav-item" onClick={onBack}>
          <i>🏠</i>
          <span>Home</span>
        </a>
        <a href="#" className="nav-item" onClick={() => alert('Products clicked')}>
          <i>📋</i>
          <span>Products</span>
        </a>
        <a href="#" className="nav-item active">
          <i>💰</i>
          <span>Wallet</span>
        </a>
        <a href="#" className="nav-item" onClick={() => alert('Profile clicked')}>
          <i>👤</i>
          <span>Profile</span>
        </a>
      </div>
    </div>
  );
}

export default RechargeForm;