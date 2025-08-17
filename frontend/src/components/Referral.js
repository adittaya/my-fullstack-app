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
    <div style={{ padding: '16px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px'
      }}>
        <button 
          onClick={onBack}
          className="secondary-button"
          style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}
        >
          ←
        </button>
        <h1 style={{ 
          margin: '0', 
          fontSize: '24px', 
          background: 'linear-gradient(to right, var(--gold-primary), var(--royal-blue-light))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: '700'
        }}>
          Refer & Earn
        </h1>
        <div style={{ width: '40px' }}></div> {/* Spacer for alignment */}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="premium-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '24px', 
            color: 'var(--text-primary)',
            fontWeight: '600'
          }}>
            Invite Friends, Earn Rewards!
          </h2>
          <p style={{ 
            margin: '0', 
            color: 'var(--text-secondary)',
            lineHeight: '1.6'
          }}>
            Share your referral link and earn when your friends join and make their first investment.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div className="premium-card" style={{ 
            margin: 0, 
            padding: '20px',
            textAlign: 'center',
            background: 'rgba(30, 30, 50, 0.5)',
            border: '1px solid rgba(255, 215, 0, 0.2)'
          }}>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              color: 'var(--gold-primary)',
              margin: '0 0 8px 0'
            }}>
              ₹100
            </div>
            <div style={{ 
              color: 'var(--text-secondary)',
              fontSize: '14px'
            }}>
              Your Reward
            </div>
          </div>
          <div className="premium-card" style={{ 
            margin: 0, 
            padding: '20px',
            textAlign: 'center',
            background: 'rgba(30, 30, 50, 0.5)',
            border: '1px solid rgba(65, 105, 225, 0.2)'
          }}>
            <div style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              color: 'var(--royal-blue-light)',
              margin: '0 0 8px 0'
            }}>
              ₹50
            </div>
            <div style={{ 
              color: 'var(--text-secondary)',
              fontSize: '14px'
            }}>
              Friend's Reward
            </div>
          </div>
        </div>

        <div className="premium-card" style={{ 
          margin: '0 0 24px 0', 
          padding: '20px',
          background: 'rgba(30, 30, 50, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            color: 'var(--text-primary)',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            Your Referral Link
          </h3>
          
          <div style={{ 
            position: 'relative',
            marginBottom: '16px'
          }}>
            <input
              type="text"
              value={referralLink || (loading ? 'Loading...' : '')}
              readOnly
              placeholder="Loading referral link..."
              style={{ 
                width: '100%',
                padding: '16px',
                background: 'rgba(30, 30, 50, 0.5)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                paddingRight: '100px'
              }}
            />
            <button 
              onClick={copyReferralLink}
              disabled={!referralLink || loading}
              className="secondary-button"
              style={{ 
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '8px 16px'
              }}
            >
              {loading ? 'Loading...' : 'Copy'}
            </button>
          </div>
          
          <button 
            onClick={shareReferralLink}
            className="gradient-button"
            style={{ width: '100%', padding: '16px' }}
            disabled={!referralLink || loading}
          >
            Share Referral Link
          </button>
        </div>

        <div className="premium-card" style={{ 
          margin: 0, 
          padding: '20px',
          background: 'rgba(30, 30, 50, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <h3 style={{ 
            margin: '0 0 12px 0', 
            color: 'var(--text-primary)',
            fontWeight: '600'
          }}>
            How it works:
          </h3>
          <ol style={{ 
            margin: '0', 
            padding: '0 0 0 20px',
            color: 'var(--text-secondary)'
          }}>
            <li style={{ margin: '8px 0' }}>Share your referral link with friends</li>
            <li style={{ margin: '8px 0' }}>Friend signs up using your link</li>
            <li style={{ margin: '8px 0' }}>Friend makes their first investment</li>
            <li style={{ margin: '8px 0' }}>You both receive rewards!</li>
          </ol>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="fab" onClick={onBack}>
        +
      </button>
    </div>
  );
}

export default Referral;