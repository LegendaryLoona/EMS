import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ManagerDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [requests, setRequests] = useState([]);
  const [newRequest, setNewRequest] = useState({
    name: '',
    description: '',
    date: '',
  });

  const token = localStorage.getItem('accessToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchTasks = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/tasks/`, config)
      .then(res => setTaskList(res.data))
      .catch(err => console.error('Fetching tasks failed', err));
  };

  const fetchRequests = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/requests/manager/`, config)
      .then(res => setRequests(res.data))
      .catch(err => console.error('Fetching requests failed', err));
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    axios.post(`${process.env.REACT_APP_API_URL}/api/requests/manager/`, newRequest, config)
      .then(() => {
        alert('Request submitted!');
        fetchRequests();
        setNewRequest({ name: '', description: '', date: '' });
      })
      .catch(err => {
        console.error('Error submitting request', err);
        alert('Failed to submit request.');
      });
  };

  const handleAssignTask = (e) => {
    e.preventDefault();
    const payload = {
      ...taskForm,
      assigned_by: employeeProfile.id
    };
    axios.post(`${process.env.REACT_APP_API_URL}/api/tasks/`, payload, config)
      .then(() => {
        fetchTasks();
        setTaskForm({ assigned_to: '', title: '', description: '', deadline: '' });
      })
      .catch(err => console.error('Error assigning task', err));
  };

  const [taskForm, setTaskForm] = useState({
    assigned_to: '',
    title: '',
    description: '',
    deadline: ''
  });

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/my-profile/`, config)
      .then(res => {
        setEmployeeProfile(res.data);
        if (res.data.department) {
          axios.get(`${process.env.REACT_APP_API_URL}/api/departments/${res.data.department}/employees/`, config)
            .then(empRes => setDepartmentEmployees(empRes.data))
            .catch(err => console.error('Error fetching department employees:', err));
        }
      })
      .catch(err => console.error('Error fetching profile:', err));
  }, []);

  useEffect(() => {
    if (employeeProfile?.id) {
      fetchTasks();
      fetchRequests();
    }
  }, [employeeProfile]);

  return (
    <div className="dashboard employee-dashboard">
      <h2>Manager Dashboard</h2>
      <p>Welcome, {user.username}!</p>

      <div className="tabs" style={{ marginTop: '1rem' }}>
        <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'active' : ''}>My Profile</button>
        <button onClick={() => setActiveTab('tasks')} className={activeTab === 'tasks' ? 'active' : ''}>Tasks</button>
        <button onClick={() => setActiveTab('requests')} className={activeTab === 'requests' ? 'active' : ''}>Requests</button>
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

        {activeTab === 'tasks' && (
          <div>
            <h3>Assign Tasks</h3>
            <form onSubmit={handleAssignTask} style={{ marginBottom: '1.5rem' }}>
              <div className="form-row">
                <select required value={taskForm.assigned_to} onChange={e => setTaskForm({ ...taskForm, assigned_to: e.target.value })}>
                  <option value="">Select Employee</option>
                  {departmentEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                  ))}
                </select>
                <input type="text" placeholder="Task title" required value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
                <input type="date" value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} />
              </div>
              <textarea placeholder="Task description" rows="3" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
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
                </tr>
              </thead>
              <tbody>
                {taskList.map(task => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.assigned_to_name}</td>
                    <td>{task.status}</td>
                    <td>{task.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'requests' && (
          <div>
            <h3>Submit Request</h3>
            <form onSubmit={handleSubmitRequest} style={{ marginBottom: '1.5rem' }}>
              <input type="text" placeholder="Request Name" required value={newRequest.name} onChange={e => setNewRequest({ ...newRequest, name: e.target.value })} />
              <textarea placeholder="Description" required rows="3" value={newRequest.description} onChange={e => setNewRequest({ ...newRequest, description: e.target.value })} />
              <input type="date" required value={newRequest.date} onChange={e => setNewRequest({ ...newRequest, date: e.target.value })} />
              <button type="submit">Submit Request</button>
            </form>

            <h4>My Requests</h4>
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(request => (
                  <tr key={request.id}>
                    <td>{request.name}</td>
                    <td>{request.description}</td>
                    <td>{request.date}</td>
                    <td>{request.status}</td>
                    <td>{request.comment || '-'}</td>
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
