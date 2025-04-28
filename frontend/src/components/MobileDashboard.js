import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MobileDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('accessToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch profile when component mounts
  useEffect(() => {
    if (user && user.id) {
      axios.get(`${process.env.REACT_APP_MOBILE_API_URL}/profile?user_id=${user.id}`, config)
        .then(res => {
          setProfile(res.data);
        })
        .catch(err => {
          console.error('Error fetching mobile profile:', err);
          setError('Error fetching profile data. Please try again.');
        });
    } else {
      setError('User ID is not available');
    }
  }, [user]);

  // Fetch tasks when profile is loaded
  useEffect(() => {
    if (profile?.employee_id) {
      fetchTasks();
    }
  }, [profile]);

  const fetchTasks = () => {
    axios.get(`${process.env.REACT_APP_MOBILE_API_URL}/tasks?user_id=${user.id}`, config)
      .then(res => {
        const employeeId = profile?.employee_id;
        if (employeeId) {
          const tasksForMe = res.data.filter(task => task.assigned_to === employeeId);
          setMyTasks(tasksForMe);
        }
      })
      .catch(err => console.error('Error fetching tasks:', err));
  };

  const handleSubmitTask = (taskId) => {
    axios.post(`${process.env.REACT_APP_API_URL}/task_submit?task_id=${taskId}`, {}, config)
      .then(() => {
        alert('Task submitted!');
        fetchTasks();
      })
      .catch(err => {
        console.error('Error submitting task:', err);
        alert('Error submitting task.');
      });
  };

  return (
    <div className="dashboard mobile-dashboard">
      <h2>Mobile Dashboard</h2>
      <p>Welcome, {user.username}!</p>

      {error && <p className="error">{error}</p>}

      {/* Tabs */}
      <div className="tabs" style={{ marginTop: '1rem' }}>
        <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
          Profile
        </button>
        <button className={activeTab === 'tasks' ? 'active' : ''} onClick={() => setActiveTab('tasks')}>
          My Tasks
        </button>
      </div>

      <div className="dashboard-content" style={{ marginTop: '1rem' }}>
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <>
            {profile ? (
              <div>
                <h3>{profile.first_name} {profile.last_name}</h3>
                <p><strong>Position:</strong> {profile.position || 'N/A'}</p>
                <p><strong>Manager:</strong> {profile.manager || 'N/A'}</p>
                <p><strong>Department:</strong> {profile.department || 'N/A'}</p>
                <p><strong>Salary:</strong> ${profile.salary || 'N/A'}</p>
                <p><strong>Hire Date:</strong> {profile.hire_date || 'N/A'}</p>
              </div>
            ) : (
              <p>Loading profile...</p>
            )}
          </>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div>
            <h3>My Tasks</h3>
            {myTasks.length === 0 ? (
              <p>No tasks assigned.</p>
            ) : (
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Deadline</th>
                    <th>Comment</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myTasks.map(task => (
                    <tr key={task.id}>
                      <td>{task.title}</td>
                      <td>{task.status}</td>
                      <td>{task.description}</td>
                      <td>{task.rejection_comment}</td>
                      <td>{task.deadline}</td>
                      <td>
                        {task.status === 'in_progress' && (
                          <button onClick={() => handleSubmitTask(task.id)}>
                            Submit
                          </button>
                        )}
                        {(task.status === 'submitted' || task.status === 'completed') && (
                          <span>-</span>
                        )}
                      </td>
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

export default MobileDashboard;
