import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManagerDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [departmentEmployees, setDepartmentEmployees] = useState([]);

  const token = localStorage.getItem('accessToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    // Fetch manager's employee profile
    axios.get('http://localhost:8000/api/my-profile/', config)
      .then(res => {
        setEmployeeProfile(res.data);
        if (res.data.department) {
          // Then fetch employees in the same department
          axios.get(`http://localhost:8000/api/departments/${res.data.department}/employees/`, config)
            .then(empRes => setDepartmentEmployees(empRes.data))
            .catch(err => console.error('Error fetching department employees:', err));
        }
      })
      .catch(err => console.error('Error fetching profile:', err));
  }, []);

  return (
    <div className="dashboard employee-dashboard">
      <h2>Manager Dashboard</h2>
      <p>Welcome, {user.username}!</p>

      <div className="tabs" style={{ marginTop: '1rem' }}>
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
          My Profile
        </button>
        <button className={activeTab === 'department' ? 'active' : ''} onClick={() => setActiveTab('department')}>
          My Department
        </button>
      </div>

      <div className="dashboard-content" style={{ marginTop: '1rem' }}>
        {activeTab === 'profile' && employeeProfile && (
          <div>
            <h3>{employeeProfile.first_name} {employeeProfile.last_name}</h3>
            <p><strong>Position:</strong> {employeeProfile.position}</p>
            <p><strong>Department:</strong> {employeeProfile.department_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Hire Date:</strong> {employeeProfile.hire_date}</p>
          </div>
        )}

        {activeTab === 'department' && (
          <div>
            <h3>Employees in Your Department</h3>
            {departmentEmployees.length === 0 ? (
              <p>No employees found in your department.</p>
            ) : (
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Email</th>
                    <th>Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentEmployees.map(emp => (
                    <tr key={emp.id}>
                      <td>{emp.first_name} {emp.last_name}</td>
                      <td>{emp.position}</td>
                      <td>{emp.user_email}</td>
                      <td>${parseFloat(emp.salary).toFixed(2)}</td>
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

export default ManagerDashboard;
