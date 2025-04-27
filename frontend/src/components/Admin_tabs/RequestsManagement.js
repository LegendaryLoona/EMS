import React, { useEffect, useState } from 'react';
import axios from 'axios';

function RequestsManagement() {
  const [requests, setRequests] = useState([]);

  const token = localStorage.getItem('accessToken');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const fetchRequests = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/requests/admin/`, config)
      .then(res => setRequests(res.data))
      .catch(err => console.error('Failed to fetch requests', err));
  };

  const handleReview = (requestId, action) => {
    const comment = prompt(`Enter a comment for ${action}:`);
    if (comment !== null) {
      axios.patch(`${process.env.REACT_APP_API_URL}/api/requests/${requestId}/review/`, {
        action,
        comment,
      }, config)
      .then(() => {
        alert(`Request ${action}d successfully.`);
        fetchRequests();
      })
      .catch(err => {
        console.error('Failed to review request', err);
        alert('Error reviewing request.');
      });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div>
      <h3>Requests Management</h3>
      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <table className="employee-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Submitted By</th>
              <th>Date Submitted</th>
              <th>Status</th>
              <th>Admin Comment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td>{req.name}</td>
                <td>{req.description}</td>
                <td>{req.submitted_by_name}</td>
                <td>{new Date(req.date_submitted).toLocaleDateString()}</td>
                <td>{req.status}</td>
                <td>{req.admin_comment || '-'}</td>
                <td>
                  {req.status === 'pending' ? (
                    <div>
                      <button onClick={() => handleReview(req.id, 'complete')}>Complete</button>
                      <button onClick={() => handleReview(req.id, 'decline')}>Decline</button>
                    </div>
                  ) : (
                    <span>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RequestsManagement;
