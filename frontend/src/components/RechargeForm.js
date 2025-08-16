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
  const [formData, setFormData] = useState({
    amount: '',
    utr: ''
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
      await axios.post(`${API_BASE_URL}/api/recharge`, 
        {
          amount: parseFloat(formData.amount),
          utr: formData.utr
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccess('Recharge request submitted successfully! Waiting for admin approval.');
      // Reset form
      setFormData({
        amount: '',
        utr: ''
      });
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

  return (
    <div className="recharge-form">
      <div className="header">
        <h2>Recharge Wallet</h2>
        <button onClick={onBack}>Back to Dashboard</button>
      </div>
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      
      <div className="upi-instructions">
        <h3>Pay via UPI</h3>
        <p>Scan the QR code or use the UPI ID below:</p>
        <button onClick={copyUPIId}>Copy UPI ID</button>
        <p className="upi-id">7047571829@upi</p>
        <div className="qr-code-container">
          <img src={qrCodeImage} alt="UPI Payment QR Code" className="qr-code" />
        </div>
        {formData.amount && (
          <div className="amount-display">
            <p><strong>Amount to Pay:</strong> ₹{formData.amount}</p>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Amount (₹):</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="100"
            required
          />
        </div>
        
        <div>
          <label>UTR Number:</label>
          <input
            type="text"
            name="utr"
            value={formData.utr}
            onChange={handleChange}
            placeholder="Enter UPI transaction reference"
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Submit Recharge Request'}
        </button>
      </form>
      
      <div className="recharge-info">
        <p><strong>Note:</strong> After payment, enter the UTR number for admin approval.</p>
        <p><strong>Minimum recharge amount:</strong> ₹100</p>
      </div>
    </div>
  );
}

export default RechargeForm;