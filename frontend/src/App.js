import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      console.log("Retrieved user from localStorage:", parsedUser);
      console.log("User role:", parsedUser.role);
      setUser(parsedUser);
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    console.log("Login successful, received data:", userData);
    console.log("User role from login:", userData.user.role);
    
    // Make sure we're setting the full user object including role
    setUser(userData.user);
    localStorage.setItem('user', JSON.stringify(userData.user));
    localStorage.setItem('accessToken', userData.access);
    localStorage.setItem('refreshToken', userData.refresh);
  };

  const handleLogout = () => {
    console.log("Logging out");
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  console.log("Current user state:", user);
  console.log("User role for rendering decision:", user?.role);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Employee Management System</h1>
        {user && (
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        )}
      </header>

      <main>
        {!user ? (
          <Login onLogin={handleLogin} />
        ) : user.role === 'admin' ? (
          <>
            <div style={{color: 'red'}}>Role is: {user.role}</div>
            <AdminDashboard user={user} />
          </>
        ) : user.role === 'manager' ? (
          <>
            <div style={{color: 'red'}}>Role is: {user.role}</div>
            <ManagerDashboard user={user} />
          </>
        ) : (
          <>
            <div style={{color: 'red'}}>Role is: {user.role}</div>
            <EmployeeDashboard user={user} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;