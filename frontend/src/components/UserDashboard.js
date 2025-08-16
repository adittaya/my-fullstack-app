import React from 'react';

function UserDashboard({ token, userData, onLogout, onViewChange }) {
  return (
    <div className="user-dashboard">
      <div className="header">
        <h2>Welcome, {userData?.name || 'User'}!</h2>
        <button onClick={onLogout}>Logout</button>
      </div>
      
      <div className="user-info">
        <h3>User Information</h3>
        <p><strong>Email:</strong> {userData?.email || 'Not provided'}</p>
        <p><strong>Mobile:</strong> {userData?.mobile || 'Not provided'}</p>
        <p><strong>Balance:</strong> ₹{userData?.balance || 0}</p>
      </div>
      
      <div className="quick-actions">
        <button onClick={() => onViewChange('plans')}>View Plans</button>
        <button onClick={() => onViewChange('withdraw')}>Withdraw</button>
        <button onClick={() => onViewChange('recharge')}>Recharge</button>
        <button onClick={() => onViewChange('referral')}>Share Referral</button>
      </div>
    </div>
  );
}

export default UserDashboard;