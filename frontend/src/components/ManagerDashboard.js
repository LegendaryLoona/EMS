import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ManagerDashboard({ user, token }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [formData, setFormData] = useState({
    employee: '',
    date: '',
    clock_in: '',
    clock_out: ''
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const profileRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/my-profile/`, config);
        const departmentId = profileRes.data.department;
        const employeeRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/departments/${departmentId}/employees/`, config);
        setEmployees(employeeRes.data);

        const attendanceRes = await axios.get(`${process.env.REACT_APP_API_URL}/api/attendance/`, config);
        setAttendanceData(attendanceRes.data);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };

    fetchEmployees();
  }, [token]);

  const handleTabChange = tab => setActiveTab(tab);

  const handleChange = e =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(`${process.env.REACT_APP_API_URL}/api/attendance/mark/`, formData, config);
      alert('Attendance marked successfully!');
    } catch (err) {
      console.error('Error marking attendance:', err);
    }
  };

  return (
    <div className="dashboard employee-dashboard">
      <h2>Manager Dashboard</h2>
      <p>Welcome, {user.first_name}!</p>

      <div className="tabs">
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => handleTabChange('profile')}>My Profile</button>
        <button className={activeTab === 'department' ? 'active' : ''} onClick={() => handleTabChange('department')}>Department</button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'profile' && (
          <div>
            <h3>Profile Information</h3>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        )}

        {activeTab === 'department' && (
          <div>
            <h3>Employees in Your Department</h3>
            <table className="employee-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Job Title</th>
                  <th>Salary</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td>{emp.id}</td>
                    <td>{emp.user.first_name} {emp.user.last_name}</td>
                    <td>{emp.job_title}</td>
                    <td>${emp.salary}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3>Mark Attendance</h3>
            <form onSubmit={handleSubmit} className="employee-form">
              <select name="employee" onChange={handleChange} required>
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user.first_name} {emp.user.last_name}
                  </option>
                ))}
              </select>
              <input type="date" name="date" onChange={handleChange} required />
              <input type="datetime-local" name="clock_in" onChange={handleChange} required />
              <input type="datetime-local" name="clock_out" onChange={handleChange} required />
              <button type="submit">Submit Attendance</button>
            </form>

            <h3>Attendance Records</h3>
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Employee</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Hours Worked</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map(record => (
                  <tr key={record.id}>
                    <td>{record.date}</td>
                    <td>{record.employee_name}</td>
                    <td>{record.clock_in ? new Date(record.clock_in).toLocaleString() : '-'}</td>
                    <td>{record.clock_out ? new Date(record.clock_out).toLocaleString() : '-'}</td>
                    <td>{record.hours_worked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManagerDashboard;
