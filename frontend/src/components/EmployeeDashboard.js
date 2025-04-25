import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EmployeeDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [employeeProfile, setEmployeeProfile] = useState(null);

  const token = localStorage.getItem('accessToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/my-profile/`, config)
      .then(res => setEmployeeProfile(res.data))
      .catch(err => console.error('Error fetching employee profile:', err));
  }, []);

  return (
    <div className="dashboard employee-dashboard">
      <h2>Employee Dashboard</h2>
      <p>Welcome, {user.username}!</p>

      <div className="tabs" style={{ marginTop: '1rem' }}>
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
          My Profile
        </button>
      </div>

      <div className="dashboard-content" style={{ marginTop: '1rem' }}>
        {activeTab === 'profile' && employeeProfile && (
          <div>
            <h3>{employeeProfile.first_name} {employeeProfile.last_name}</h3>
            <p><strong>Employee ID:</strong> {employeeProfile.employee_id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Position:</strong> {employeeProfile.position}</p>
            <p><strong>Hire Date:</strong> {employeeProfile.hire_date}</p>
            <p><strong>Salary:</strong> ${parseFloat(employeeProfile.salary).toFixed(2)}</p>
            <p><strong>Gender:</strong> {employeeProfile.gender}</p>
            <p><strong>Date of Birth:</strong> {employeeProfile.date_of_birth}</p>
            <p><strong>Address:</strong> {employeeProfile.address}</p>

            <p><strong>Department:</strong> {employeeProfile.department_name}</p>
            <p><strong>Manager:</strong> {employeeProfile.manager_name}</p>
            <p><strong>Manager Email:</strong> {employeeProfile.manager_email || 'N/A'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmployeeDashboard;
