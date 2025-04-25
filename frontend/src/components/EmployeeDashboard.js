import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EmployeeDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/my-profile/`, config)
      .then(res => setEmployeeProfile(res.data))
      .catch(err => console.error('Error fetching profile:', err));
  
    axios.get(`${process.env.REACT_APP_API_URL}/api/my-attendance/`, config)
      .then(res => setAttendanceRecords(res.data))
      .catch(err => console.error('Error fetching attendance:', err));
  }, []);
  
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
  <button className={activeTab === 'attendance' ? 'active' : ''} onClick={() => setActiveTab('attendance')}>
    Attendance
  </button>
</div>

  <div className="dashboard-content" style={{ marginTop: '1rem' }}>
    {activeTab === 'profile' && employeeProfile && (
      <div>
        <h3>{employeeProfile.first_name} {employeeProfile.last_name}</h3>
        <p><strong>Position:</strong> {employeeProfile.position}</p>
        <p><strong>Department:</strong> {employeeProfile.department_name}</p>
        <p><strong>Manager:</strong> {employeeProfile.manager_name} ({employeeProfile.manager_email})</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Hire Date:</strong> {employeeProfile.hire_date}</p>
      </div>
    )}

    {activeTab === 'attendance' && (
      <div>
        <h3>My Attendance (Last 30 Days)</h3>
        {attendanceRecords.length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          <table className="employee-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Hours Worked</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record, index) => (
                <tr key={index}>
                  <td>{record.date}</td>
                  <td>{record.clock_in ? new Date(record.clock_in).toLocaleTimeString() : '—'}</td>
                  <td>{record.clock_out ? new Date(record.clock_out).toLocaleTimeString() : '—'}</td>
                  <td>{record.hours_worked} hrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    )}
  </div>

    </div>
  );
}

export default EmployeeDashboard;
