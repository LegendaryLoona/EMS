import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MobileDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [myTasks, setMyTasks] = useState([]);

  const token = localStorage.getItem('accessToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const mobileApiUrl = process.env.REACT_APP_MOBILE_API_URL;

  const fetchTasks = () => {
    axios.get(`${mobileApiUrl}/tasks`, config)
      .then(res => {
        setMyTasks(res.data);
      })
      .catch(err => console.error('Error fetching tasks:', err));
  };

  const handleSubmitTask = (taskId) => {
    axios.post(`${mobileApiUrl}/tasks/${taskId}/submit`, {}, config)
      .then(() => {
        alert('Task submitted!');
        fetchTasks();
      })
      .catch(err => {
        console.error('Error submitting task:', err);
        alert('Error submitting task.');
      });
  };

  useEffect(() => {
    axios.get(`${mobileApiUrl}/profile`, config)
      .then(res => {
        setEmployeeProfile(res.data);
      })
      .catch(err => console.error('Error fetching profile:', err));
    
    axios.get(`${mobileApiUrl}/attendance`, config)
      .then(res => setAttendanceRecords(res.data))
      .catch(err => console.error('Error fetching attendance:', err));
      
    fetchTasks();
  }, []);

  return (
    <div className="mobile-dashboard">
      <h2>Employee Dashboard</h2>
      <p>Welcome, {user.username}!</p>

      <div className="mobile-tabs">
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
          Profile
        </button>
        <button className={activeTab === 'attendance' ? 'active' : ''} onClick={() => setActiveTab('attendance')}>
          Attendance
        </button>
        <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}>
          Tasks
        </button>
      </div>

      <div className="mobile-content">
        {activeTab === 'profile' && employeeProfile && (
          <div className="profile-card">
            <h3>{employeeProfile.first_name} {employeeProfile.last_name}</h3>
            <p><strong>Position:</strong> {employeeProfile.position}</p>
            <p><strong>Department:</strong> {employeeProfile.department_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="attendance-list">
            <h3>Recent Attendance</h3>
            {attendanceRecords.length === 0 ? (
              <p>No attendance records found.</p>
            ) : (
              attendanceRecords.map((record, index) => (
                <div key={index} className="attendance-item">
                  <div className="date">{record.date}</div>
                  <div className="times">
                    <span>In: {record.clock_in ? new Date(record.clock_in).toLocaleTimeString() : '—'}</span>
                    <span>Out: {record.clock_out ? new Date(record.clock_out).toLocaleTimeString() : '—'}</span>
                  </div>
                  <div className="hours">{record.hours_worked} hrs</div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="tasks-list">
            <h3>My Tasks</h3>
            {myTasks.length === 0 ? (
              <p>No tasks assigned.</p>
            ) : (
              myTasks.map(task => (
                <div key={task.id} className="task-item">
                  <div className="task-header">
                    <h4>{task.title}</h4>
                    <span className={`status ${task.status}`}>{task.status}</span>
                  </div>
                  <p>{task.description}</p>
                  <div className="task-footer">
                    <span>Due: {task.deadline}</span>
                    {task.status === 'in_progress' && (
                      <button onClick={() => handleSubmitTask(task.id)}>
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileDashboard;