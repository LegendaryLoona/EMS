import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MobileDashboard({ user }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  // Get the token from localStorage
  const token = localStorage.getItem('accessToken');
  const config = { 
    headers: { Authorization: `Bearer ${token}` } 
  };

  // Fetch the profile when the component mounts
  useEffect(() => {
    if (user && user.id) {
      // Make sure user.id is available for the API call
      axios.get(`${process.env.REACT_APP_MOBILE_API_URL}/profile?user_id=1`, config)
        .then(res => {
          console.log('Profile data:', res.data);  // Log the response for debugging
          setProfile(res.data);
        })
        .catch(err => {
          console.error('Error fetching mobile profile:', err);
          setError('Error fetching profile data. Please try again.');
        });
    } else {
      setError('User ID is not available');
    }
  }, [user]); // Re-fetch profile if user changes
  
  return (
    <div className="dashboard mobile-dashboard">
      <h2>Mobile Dashboard</h2>
      <p>Welcome, {user.username}!</p>

      {error && <p className="error">{error}</p>}

      {profile ? (
        <div>
          <h3>{profile.first_name} {profile.last_name}</h3>
          <p><strong>Email:</strong> {profile.email || 'N/A'}</p>
          <p><strong>Position:</strong> {profile.position || 'N/A'}</p>
          <p><strong>Department:</strong> {profile.department || 'N/A'}</p>
          <p><strong>Salary:</strong> ${profile.salary || 'N/A'}</p>
          <p><strong>Hire Date:</strong> {profile.hire_date || 'N/A'}</p>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}

export default MobileDashboard;
