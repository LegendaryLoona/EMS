import React from 'react';
function MobileDashboard({ user }) {
    return (
      <div className="dashboard employee-dashboard">
        <h2>Mobile Dashboard</h2>
        <p>Welcome, {user.username}!</p>
        <div className="dashboard-content">
          <p>This is a placeholder for the Mobile dashboard.</p>
          <p>Here you would see employee-specific features.</p>
          <ul>
            <li>My Profile</li>
            <li>Attendance</li>
            <li>Leave Requests</li>
            <li>Documents</li>
          </ul>
        </div>
      </div>
    );
  }
  
  export default MobileDashboard;