import React, { useState, useEffect } from 'react';
import axios from 'axios';

function EmployeeManagementTab() {
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [filterText, setFilterText] = useState('');
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(initialForm());
  const [departments, setDepartments] = useState([]);


  function initialForm() {
    return {
      employee_id: '',
      first_name: '',
      last_name: '',
      gender: 'M',
      date_of_birth: '',
      address: '',
      hire_date: '',
      position: '',
      salary: '',
      is_active: true,
      manager: '',
      user: '',
      department: '',
    };
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [empRes, usersRes, deptsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/employees/`, config),
        axios.get(`${process.env.REACT_APP_API_URL}/api/users/`, config),
        axios.get(`${process.env.REACT_APP_API_URL}/api/departments/`, config),
      ]);

      setEmployees(empRes.data);
      setFiltered(empRes.data);
      setUsers(usersRes.data);
      setDepartments(deptsRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const handleFilter = (e) => {
    const query = e.target.value.toLowerCase();
    setFilterText(query);
    setFiltered(employees.filter(emp =>
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(query) ||
      emp.position.toLowerCase().includes(query) ||
      emp.department_name?.toLowerCase().includes(query)
    ));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleEdit = (emp) => {
    setEditingEmployee(emp.id);
    setFormData({
      ...emp,
      manager: emp.manager || '',
      user: emp.user || '',
      department: emp.department || '',
    });
  };

  const handleCancel = () => {
    setEditingEmployee(null);
    setFormData(initialForm());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingEmployee) {
        await axios.put(`${process.env.REACT_APP_API_URL}/api/employees/${editingEmployee}/`, formData, config);
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/employees/`, formData, config);
      }

      fetchData();
      setEditingEmployee(null);
      setFormData(initialForm());
    } catch (err) {
      console.error("Error saving employee", err);
    }
  };

  return (
    <div className="employee-management">
      <h3>Employee Management</h3>

      <input
        type="text"
        placeholder="Filter by name, position or department"
        value={filterText}
        onChange={handleFilter}
        style={{ marginBottom: '1rem', padding: '0.5rem', width: '100%' }}
      />

      <table className="employee-table">
        <thead>
          <tr>
            <th>Employee ID</th><th>Name</th><th>Position</th><th>Department</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(emp => (
            <tr key={emp.id}>
              <td>{emp.employee_id}</td>
              <td>{emp.first_name} {emp.last_name}</td>
              <td>{emp.position}</td>
              <td>{emp.department_name || '—'}</td>
              <td>{emp.is_active ? 'Active' : 'Inactive'}</td>
              <td>
                <button onClick={() => handleEdit(emp)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="employee-form">
        <h4>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h4>
        <form onSubmit={handleSubmit}>
          <input type="text" name="employee_id" value={formData.employee_id} onChange={handleChange} placeholder="Employee ID" required />
          <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="First Name" required />
          <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last Name" required />
          
          <label>
            Gender:
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </label>

          <label>
            Date of Birth:
            <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} placeholder="DOB" required />
          </label>
          <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
          <label>
            Hire Date:
            <input type="date" name="hire_date" value={formData.hire_date} onChange={handleChange} placeholder="Hire Date" required />
          </label>
          <input type="text" name="position" value={formData.position} onChange={handleChange} placeholder="Position" required />
          <input type="number" name="salary" value={formData.salary} onChange={handleChange} placeholder="Salary" required />

          <label>
            Active:
            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} />
          </label>

          <label>
            Manager:
            <select name="manager" value={formData.manager || ''} onChange={handleChange}>
              <option value="">None</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
          </label>
          
          <label>
            Department:
            <select name="department" value={formData.department || ''} onChange={handleChange}>
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Linked User:
            <select name="user" value={formData.user || ''} onChange={handleChange} required>
              <option value="">Select User</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          </label>

          <button type="submit">{editingEmployee ? 'Update' : 'Add Employee'}</button>
          {editingEmployee && <button type="button" onClick={handleCancel}>Cancel</button>}
        </form>
      </div>
    </div>
  );
}

export default EmployeeManagementTab;
