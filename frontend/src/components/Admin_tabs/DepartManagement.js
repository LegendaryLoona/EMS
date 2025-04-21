import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/departments/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to fetch departments', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      if (isEditing) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/departments/${editingId}/`, formData, config);
        setMessage('Department updated');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/departments/`, formData, config);
        setMessage('Department created');
      }

      setFormData({ name: '', description: '' });
      setIsEditing(false);
      setEditingId(null);
      fetchDepartments();
    } catch (err) {
      console.error('Failed to save department', err);
      setMessage('Error saving department');
    }
  };

  const handleEdit = (dept) => {
    setIsEditing(true);
    setEditingId(dept.id);
    setFormData({ name: dept.name, description: dept.description || '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    const token = localStorage.getItem('accessToken');
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/departments/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDepartments();
    } catch (err) {
      console.error('Failed to delete department', err);
    }
  };

  const cancelEdit = () => {
    setFormData({ name: '', description: '' });
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <div className="department-container">
      <h2 className="department-title">Department Management</h2>

      {message && (
        <div className="mb-3 text-sm text-blue-600">{message}</div>
      )}

      <form onSubmit={handleSubmit} className="department-form">
        <input
          type="text"
          name="name"
          placeholder="Department Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="border p-2 w-full"
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="border p-2 w-full"
        ></textarea>
        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            {isEditing ? 'Update' : 'Create'}
          </button>
          {isEditing && (
            <button type="button" onClick={cancelEdit} className="px-4 py-2 bg-gray-300 rounded">
              Cancel
            </button>
          )}
        </div>
      </form>

      <table className="department-table">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2 text-left">Name</th>
            <th className="border px-4 py-2 text-left">Description</th>
            <th className="border px-4 py-2">Employees</th>
            <th className="border px-4 py-2">Total Salary</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept) => (
            <tr key={dept.id}>
              <td className="border px-4 py-2">{dept.name}</td>
              <td className="border px-4 py-2">{dept.description || '-'}</td>
              <td className="border px-4 py-2 text-center">{dept.employee_count}</td>
              <td className="border px-4 py-2 text-center">${parseFloat(dept.total_salary).toFixed(2)}</td>
              <td className="department-actions">
                <button onClick={() => handleEdit(dept)} className="text-blue-600 mr-2">Edit</button>
                <button onClick={() => handleDelete(dept.id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DepartmentManagement;
