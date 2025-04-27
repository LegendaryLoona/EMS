import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UserManagement({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  const initialUserFormState = {
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'employee',
  };

  const [userForm, setUserForm] = useState(initialUserFormState);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [usersRes, deptsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/users/`, config),
      ]);

      setUsers(usersRes.data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm({ ...userForm, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const payload = { ...userForm };

      if (isEditing) {
        if (!payload.password) {
          delete payload.password;
        }
        await axios.put(`${process.env.REACT_APP_API_URL}/api/users/${editingUserId}/`, payload, config);
        setMessage('User updated successfully');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/users/`, payload, config);
        setMessage('User created successfully');
      }

      resetForm();
      fetchData();
    } catch (err) {
      console.error('Save error:', err.response?.data || err.message);
      setMessage(isEditing ? 'Failed to update user' : 'Failed to create user');
    }
  };

  const handleEdit = (userId) => {
    const userToEdit = users.find((u) => u.id === userId);
    if (userToEdit) {
      setUserForm({
        username: userToEdit.username,
        email: userToEdit.email,
        password: '',
        first_name: userToEdit.first_name,
        last_name: userToEdit.last_name,
        role: userToEdit.role,
      });
      setIsEditing(true);
      setEditingUserId(userId);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${userId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('User deleted successfully');
      fetchData();
    } catch (err) {
      console.error('Delete error:', err);
      setMessage('Failed to delete user');
    }
  };

  const resetForm = () => {
    setUserForm(initialUserFormState);
    setIsEditing(false);
    setEditingUserId(null);
  };

  const cancelEdit = () => resetForm();

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="user-management">
      <h3>User Management</h3>

      {message && (
        <div className={message.includes('Failed') ? 'error-message' : 'success-message'}>
          {message}
        </div>
      )}

      <div className="user-form">
        <h4>{isEditing ? 'Edit User' : 'Create New User'}</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Username:</label>
              <input type="text" name="username" value={userForm.username} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input type="email" name="email" value={userForm.email} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>First Name:</label>
              <input type="text" name="first_name" value={userForm.first_name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Last Name:</label>
              <input type="text" name="last_name" value={userForm.last_name} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>
              Password:{' '}
              {isEditing && <span className="password-hint">(Leave blank to keep current password)</span>}
            </label>
            <input
              type="password"
              name="password"
              value={userForm.password}
              onChange={handleInputChange}
              required={!isEditing}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Role:</label>
              <select name="role" value={userForm.role} onChange={handleInputChange} required>
                <option value="admin">Administrator</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit">{isEditing ? 'Update User' : 'Create User'}</button>
            {isEditing && (
              <button type="button" onClick={cancelEdit} className="cancel-button">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="user-list">
        <h4>User List</h4>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.first_name} {u.last_name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td className="user-actions">
                  <button onClick={() => handleEdit(u.id)} className="edit-button">Edit</button>
                  <button onClick={() => handleDelete(u.id)} className="delete-button">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
