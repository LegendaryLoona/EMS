import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManagerDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [departmentEmployees, setDepartmentEmployees] = useState([]);

  const token = localStorage.getItem('accessToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [taskForm, setTaskForm] = useState({
    assigned_to: '',
    title: '',
    description: '',
    deadline: ''
  });
  const [taskList, setTaskList] = useState([]);
  
  const fetchTasks = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/tasks/`, config)
      .then(res => setTaskList(res.data))
      .catch(err => console.error('Fetching tasks failed', err));
  };
  
  const handleAssignTask = (e) => {
    e.preventDefault();
    const payload = {
      ...taskForm,
      assigned_by: employeeProfile.id // manager employee ID
    };
    axios.post(`${process.env.REACT_APP_API_URL}/api/tasks/`, payload, config)
      .then(() => {
        fetchTasks();
        setTaskForm({ assigned_to: '', title: '', description: '', deadline: '' });
      })
      .catch(err => console.error('Error assigning task', err));
  };
  const handleReviewTask = (taskId, action, comment = '') => {
    axios.post(`${process.env.REACT_APP_API_URL}/api/tasks/${taskId}/review/`, { action, comment }, config)
      .then(() => {
        fetchTasks(); // Refresh task list after review
        alert(`Task ${action === 'accept' ? 'accepted' : 'rejected'}.`);
      })
      .catch(err => {
        console.error('Error reviewing task:', err);
        alert('Error processing task review.');
      });
  };
  
  useEffect(() => {
    if (employeeProfile?.id) {
      fetchTasks();
    }
  }, [employeeProfile]);
  
  useEffect(() => {
    // Fetch manager's employee profile
    axios.get(`${process.env.REACT_APP_API_URL}/api/my-profile/`, config)
      .then(res => {
        setEmployeeProfile(res.data);
        if (res.data.department) {
          // Then fetch employees in the same department
          axios.get(`${process.env.REACT_APP_API_URL}/api/departments/${res.data.department}/employees/`, config)
            .then(empRes => setDepartmentEmployees(empRes.data))
            .catch(err => console.error('Error fetching department employees:', err));
        }
      })
      .catch(err => console.error('Error fetching profile:', err));
  }, []);
  const markAttendance = (employeeId, action) => {
    axios.post(`${process.env.REACT_APP_API_URL}/api/attendance/mark/`, {
      employee_id: employeeId,
      action,
    }, config)
      .then(res => {
        const { clock_in, clock_out } = res.data;
        const statusEl = document.getElementById(`status-${employeeId}`);
        if (statusEl) {
          if (action === 'clock_in') {
            statusEl.textContent = `Clocked in at ${new Date(clock_in).toLocaleTimeString()}`;
          } else {
            statusEl.textContent = `Clocked out at ${new Date(clock_out).toLocaleTimeString()}`;
          }
        }
      })
      .catch(err => {
        console.error('Attendance error:', err);
        alert('Failed to mark attendance. Try again.');
      });
  };
  const fetchAttendanceHistory = (employeeId) => {
    setSelectedEmployee(employeeId);
    axios.get(`${process.env.REACT_APP_API_URL}/api/attendance/${employeeId}/monthly/`, config)
      .then(res => setAttendanceHistory(res.data))
      .catch(err => {
        console.error('Failed to fetch attendance history:', err);
        alert('Could not load attendance history.');
      });
  };
  
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
        <button className={activeTab === 'attendance' ? 'active' : ''} onClick={() => setActiveTab('attendance')}>
          Attendance History
        </button>
        <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}>
          Tasks
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
            <h4 style={{ marginTop: '2rem' }}>Mark Attendance</h4>
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentEmployees.map(emp => (
                    <tr key={emp.id}>
                      <td>{emp.first_name} {emp.last_name}</td>
                      <td>
                        <button onClick={() => markAttendance(emp.id, 'clock_in')}>
                          Clock In
                        </button>
                      </td>
                      <td>
                        <button onClick={() => markAttendance(emp.id, 'clock_out')}>
                          Clock Out
                        </button>
                      </td>
                      <td id={`status-${emp.id}`}></td>
                    </tr>
                  ))}
                </tbody>
              </table>

          </div>          
        )}
        {activeTab === 'attendance' && (
        <div>
          <h3>Attendance History (Last 30 Days)</h3>

          <select onChange={(e) => fetchAttendanceHistory(e.target.value)} defaultValue="">
            <option value="" disabled>Select an Employee</option>
            {departmentEmployees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name}
              </option>
            ))}
          </select>

          {selectedEmployee && attendanceHistory.length > 0 && (
            <table className="employee-table" style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.map((entry, index) => (
                  <tr key={index}>
                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                    <td>{entry.clock_in ? new Date(entry.clock_in).toLocaleTimeString() : '-'}</td>
                    <td>{entry.clock_out ? new Date(entry.clock_out).toLocaleTimeString() : '-'}</td>
                    <td>{entry.was_present ? 'Present' : 'Absent'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
  {activeTab === 'tasks' && (
    <div>
      <h3>Assign Tasks</h3>

      <form onSubmit={handleAssignTask} style={{ marginBottom: '1.5rem' }}>
        <div className="form-row">
          <select required value={taskForm.assigned_to} onChange={e => setTaskForm({...taskForm, assigned_to: e.target.value})}>
            <option value="">Select Employee</option>
            {departmentEmployees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
            ))}
          </select>

          <input type="text" placeholder="Task title" required
            value={taskForm.title}
            onChange={e => setTaskForm({...taskForm, title: e.target.value})} />

          <input type="date" value={taskForm.deadline}
            onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} />
        </div>

        <textarea placeholder="Task description" rows="3"
          value={taskForm.description}
          onChange={e => setTaskForm({...taskForm, description: e.target.value})} />

        <button type="submit">Assign Task</button>
      </form>

      <h4>Task List</h4>
      <table className="employee-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Assigned To</th>
            <th>Status</th>
            <th>Deadline</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        {taskList.map(task => (
        <tr key={task.id}>
          <td>{task.title}</td>
          <td>{task.assigned_to_name}</td>
          <td>{task.status}</td>
          <td>{task.deadline}</td>
          <td>
            {task.status === 'submitted' ? (
              <div>
                <button onClick={() => handleReviewTask(task.id, 'accept')}>Accept</button>
                <button onClick={() => {
                  const comment = prompt('Reason for rejection:');
                  if (comment !== null) {
                    handleReviewTask(task.id, 'reject', comment);
                  }
                }}>
                  Reject
                </button>
              </div>
            ) : (
              <span>-</span>
            )}
          </td>
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
