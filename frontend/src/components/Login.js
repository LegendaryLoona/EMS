import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    console.log("Attempting login with:", { username });

    try {
      // Call login API endpoint
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/login/`, {
        username,
        password
      });

      console.log("Login API response:", response.data);

      // Ensure response includes expected user role data
      if (!response.data.user || !response.data.user.role) {
        console.error("Missing user role in response:", response.data);
      }

      // Call parent login handler
      onLogin(response.data);
    } catch (err) {
      // Handle and display login errors
      console.error('Login error:', err.response ? err.response.data : err.message);
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
