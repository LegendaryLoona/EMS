import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MobileDashboard({ user }) {
  const [profile, setProfile] = useState(null);

  const token = localStorage.getItem('accessToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_MOBILE_API_URL}/profile`, config)
      .then(res => {
        console.log('Profile data:', res.data);  // Log the response
        setProfile(res.data);
      })
      .catch(err => {
        console.error('Error fetching mobile profile:', err);
      });
  }, []);
  

  return (
    <div className="dashboard mobile-dashboard">
      <h2>Mobile Dashboard</h2>
      <p>Welcome, {user.username}!</p>

      {profile ? (
        <div>
          <h3>{profile.first_name} {profile.last_name}</h3>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Position:</strong> {profile.position}</p>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
}

export default MobileDashboard;
