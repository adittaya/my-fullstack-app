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

function Referral({ token, userData, onBack }) {
  const [referralLink, setReferralLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (token) {
      fetchReferralLink();
    }
  }, [token, fetchReferralLink]);

  const fetchReferralLink = async () => {
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
  };

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
    <div className="referral">
      <div className="header">
        <h2>Share Referral</h2>
        <button onClick={onBack}>Back to Dashboard</button>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="referral-content">
        <h3>Earn by Sharing</h3>
        <p>Share your referral link with friends and earn rewards when they join!</p>

        <div className="referral-link-container">
          <p><strong>Your Referral Link:</strong></p>
          <div className="referral-link">
            <input
              type="text"
              value={referralLink}
              readOnly
              placeholder="Loading referral link..."
            />
            <button onClick={copyReferralLink} disabled={!referralLink || loading}>
              {loading ? 'Loading...' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="share-options">
          <button onClick={shareReferralLink} className="share-button">
            Share Referral Link
          </button>
        </div>

        <div className="referral-info">
          <h4>How it works:</h4>
          <ul>
            <li>Share your referral link with friends</li>
            <li>They register using your link</li>
            <li>You earn rewards when they make investments</li>
            <li>There's no limit to how much you can earn!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Referral;