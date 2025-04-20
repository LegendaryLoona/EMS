// components/AdminDashboard.js
import React, { useState } from 'react';
import UserManagement from './Admin_tabs/UserManagement';
import EmployeeInfo from './Admin_tabs/EmployeeManagement';
import DocumentsTab from './Admin_tabs/FileManagement';
import DepartmentManagement from './Admin_tabs/DepartManagement';

function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState('users');

  const renderTab = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement user={user} />;
      case 'employees':
        return <EmployeeInfo />;
      case 'documents':
        return <DocumentsTab />;
      case 'departments':
        return <DepartmentManagement/>
      default:
        return null;
    }
  };

  return (
    <div className="dashboard admin-dashboard">
      <h2>Admin Dashboard</h2>
      <p>Welcome, {user.username}!</p>

      <div className="tabs">
        <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'active' : ''}>
          User Management
        </button>
        <button onClick={() => setActiveTab('employees')} className={activeTab === 'employees' ? 'active' : ''}>
          Employee Info
        </button>
        <button onClick={() => setActiveTab('documents')} className={activeTab === 'documents' ? 'active' : ''}>
          Requests
        </button>
        <button onClick={() => setActiveTab('departments')} className={activeTab === 'departments' ? 'active' : ''}>
          Departments
        </button>
      </div>

      <div className="tab-content">{renderTab()}</div>
    </div>
  );
}

export default AdminDashboard;
