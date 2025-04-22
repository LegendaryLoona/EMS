import React from 'react';

function ManagerDashboard({ user }) {
  return (
    <div className="dashboard employee-dashboard">
      <h2>Manager Dashboard</h2>
      <p>Welcome, {user.username}!</p>
      <div className="dashboard-content">
        <p>This is a placeholder for the Manager dashboard.</p>
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

export default ManagerDashboard;