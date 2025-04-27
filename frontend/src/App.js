import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import MobileDashboard from './components/MobileDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    setIsMobile(isMobileDevice()); // detect on app load

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
    
    setUser(userData.user);
    localStorage.setItem('user', JSON.stringify(userData.user));
    localStorage.setItem('accessToken', userData.access);
    localStorage.setItem('refreshToken', userData.refresh);
    setIsMobile(isMobileDevice()); // detect again on login just in case
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
        ) : isMobile && (user.role === 'admin' || user.role === 'manager') ? (
          <div style={{ color: 'red', marginTop: '2rem' }}>
            {user.role} access is only available on PC. Please use a computer.
          </div>
        ) : isMobile && user.role === 'employee' ? (
          <MobileDashboard user={user} />
        ) : user.role === 'admin' ? (
          <AdminDashboard user={user} />
        ) : user.role === 'manager' ? (
          <ManagerDashboard user={user} />
        ) : (
          <EmployeeDashboard user={user} />
        )}
      </main>
    </div>
  );
}

export default App;
