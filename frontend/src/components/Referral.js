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

function Referral({ token, userData, onBack }) {
  const [referralLink, setReferralLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchReferralLink = useCallback(async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.get(`${API_BASE_URL}/api/referral-link`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setReferralLink(response.data.referralLink);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch referral link');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchReferralLink();
    }
  }, [token, fetchReferralLink]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setSuccess('Copied to clipboard!');
      setTimeout(() => setSuccess(''), 3000);
    }).catch(err => {
      setError('Failed to copy to clipboard');
    });
  };

  const copyReferralLink = () => {
    if (referralLink) {
      copyToClipboard(referralLink);
    } else {
      fetchReferralLink().then(() => {
        if (referralLink) {
          copyToClipboard(referralLink);
        }
      });
    }
  };

  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Investment Platform',
        text: 'Check out this amazing investment platform!',
        url: referralLink
      }).catch(err => {
        console.error('Sharing failed:', err);
        copyReferralLink();
      });
    } else {
      copyReferralLink();
    }
  };

  return (
    <div className="recharge-form">
      {/* Header */}
      <div className="header">
        <h2>Share Referral</h2>
        <button onClick={onBack}>✕</button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h3>Earn by Sharing</h3>
        <p>Share your referral link with friends and earn rewards when they join!</p>

        <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: 'var(--border-radius-xl)', margin: '20px 0' }}>
          <p><strong>Your Referral Link:</strong></p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '15px 0' }}>
            <input
              type="text"
              value={referralLink}
              readOnly
              placeholder="Loading referral link..."
              style={{ 
                flex: 1, 
                padding: '12px', 
                background: 'rgba(30, 30, 50, 0.6)', 
                border: '1px solid var(--card-border)', 
                borderRadius: 'var(--border-radius-xl)', 
                color: 'var(--text-primary)' 
              }}
            />
            <button 
              onClick={copyReferralLink} 
              disabled={!referralLink || loading}
              style={{
                padding: '12px 20px',
                background: 'linear-gradient(135deg, var(--gold-primary), var(--royal-blue))',
                color: 'var(--luxury-dark)',
                border: 'none',
                borderRadius: 'var(--border-radius-xl)',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Loading...' : 'Copy'}
            </button>
          </div>
        </div>

        <button 
          onClick={shareReferralLink}
          style={{
            width: '100%',
            padding: '15px',
            background: 'linear-gradient(135deg, var(--gold-primary), var(--royal-blue))',
            color: 'var(--luxury-dark)',
            border: 'none',
            borderRadius: 'var(--border-radius-xl)',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Share Referral Link
        </button>

        <div style={{ marginTop: '30px', textAlign: 'left' }}>
          <h4>How it works:</h4>
          <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
            <li style={{ margin: '10px 0' }}>Share your referral link with friends</li>
            <li style={{ margin: '10px 0' }}>They register using your link</li>
            <li style={{ margin: '10px 0' }}>You earn rewards when they make investments</li>
            <li style={{ margin: '10px 0' }}>There's no limit to how much you can earn!</li>
          </ul>
        </div>
      </div>

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
        <a href="#" className="nav-item" onClick={() => alert('Wallet clicked')}>
          <i>💰</i>
          <span>Wallet</span>
        </a>
        <a href="#" className="nav-item active">
          <i>👤</i>
          <span>Profile</span>
        </a>
      </div>
    </div>
  );
}

export default Referral;