import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MobileDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [employeeProfile, setEmployeeProfile] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('accessToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  
  const API_BASE = process.env.REACT_APP_MOBILE_API_URL || process.env.REACT_APP_API_URL;

  const fetchTasks = () => {
    setLoading(true);
    axios.get(`${API_BASE}/mobile/tasks/`, config)
      .then(res => {
        const employeeId = employeeProfile?.id;
        if (employeeId) {
          const tasksForMe = res.data.filter(task => task.assigned_to === employeeId);
          setMyTasks(tasksForMe);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching tasks:', err);
        setError('Failed to load tasks');
        setLoading(false);
      });
  };

  const handleSubmitTask = (taskId) => {
    setLoading(true);
    axios.post(`${API_BASE}/mobile/tasks/${taskId}/submit/`, {}, config)
      .then(() => {
        alert('Task submitted!');
        fetchTasks();
      })
      .catch(err => {
        console.error('Error submitting task:', err);
        alert('Error submitting task.');
        setLoading(false);
      });
  };

  useEffect(() => {
    setLoading(true);
    
    // Fetch profile data
    axios.get(`${API_BASE}/mobile/my-profile/`, config)
      .then(res => {
        setEmployeeProfile(res.data);
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      });
    
    // Fetch attendance data
    axios.get(`${API_BASE}/mobile/my-attendance/`, config)
      .then(res => {
        setAttendanceRecords(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching attendance:', err);
        setError('Failed to load attendance');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (employeeProfile?.id) {
      fetchTasks();
    }
  }, [employeeProfile]);

  if (loading && !employeeProfile) {
    return <div className="mobile-loading">Loading your dashboard...</div>;
  }

  if (error) {
    return <div className="mobile-error">{error}</div>;
  }

  return (
    <div className="mobile-dashboard">
      <h2>Employee Dashboard</h2>
      <p>Welcome, {user.username}!</p>

      <div className="mobile-tabs">
        <button 
          className={activeTab === 'profile' ? 'mobile-tab-active' : 'mobile-tab'} 
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button 
          className={activeTab === 'attendance' ? 'mobile-tab-active' : 'mobile-tab'} 
          onClick={() => setActiveTab('attendance')}
        >
          Attendance
        </button>
        <button 
          className={activeTab === 'tasks' ? 'mobile-tab-active' : 'mobile-tab'} 
          onClick={() => setActiveTab('tasks')}
        >
          Tasks
        </button>
      </div>

      <div className="mobile-content">
        {activeTab === 'profile' && employeeProfile && (
          <div className="mobile-profile-card">
            <div className="mobile-profile-header">
              <h3>{employeeProfile.first_name} {employeeProfile.last_name}</h3>
              <span className="mobile-position">{employeeProfile.position}</span>
            </div>
            <div className="mobile-profile-details">
              <div className="mobile-detail-item">
                <span className="mobile-label">Department:</span>
                <span>{employeeProfile.department_name}</span>
              </div>
              <div className="mobile-detail-item">
                <span className="mobile-label">Manager:</span>
                <span>{employeeProfile.manager_name}</span>
              </div>
              <div className="mobile-detail-item">
                <span className="mobile-label">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="mobile-detail-item">
                <span className="mobile-label">Hire Date:</span>
                <span>{employeeProfile.hire_date}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="mobile-attendance">
            <h3>Recent Attendance</h3>
            {attendanceRecords.length === 0 ? (
              <p className="mobile-no-data">No attendance records found.</p>
            ) : (
              <div className="mobile-attendance-list">
                {attendanceRecords.slice(0, 10).map((record, index) => (
                  <div key={index} className="mobile-attendance-card">
                    <div className="mobile-attendance-date">{record.date}</div>
                    <div className="mobile-attendance-times">
                      <div>
                        <span className="mobile-label">In:</span>
                        <span>{record.clock_in ? new Date(record.clock_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'}</span>
                      </div>
                      <div>
                        <span className="mobile-label">Out:</span>
                        <span>{record.clock_out ? new Date(record.clock_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '—'}</span>
                      </div>
                    </div>
                    <div className="mobile-hours">{record.hours_worked} hrs</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="mobile-tasks">
            <h3>My Tasks</h3>
            {myTasks.length === 0 ? (
              <p className="mobile-no-data">No tasks assigned.</p>
            ) : (
              <div className="mobile-tasks-list">
                {myTasks.map(task => (
                  <div key={task.id} className="mobile-task-card">
                    <div className={`mobile-task-status mobile-status-${task.status}`}>{task.status}</div>
                    <h4 className="mobile-task-title">{task.title}</h4>
                    <p className="mobile-task-desc">{task.description}</p>
                    <div className="mobile-task-deadline">
                      <span className="mobile-label">Due:</span>
                      <span>{task.deadline}</span>
                    </div>
                    {task.rejection_comment && (
                      <div className="mobile-task-comment">
                        <span className="mobile-label">Comment:</span>
                        <span>{task.rejection_comment}</span>
                      </div>
                    )}
                    {task.status === 'in_progress' && (
                      <button 
                        className="mobile-submit-button"
                        onClick={() => handleSubmitTask(task.id)}
                      >
                        Submit Task
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileDashboard;