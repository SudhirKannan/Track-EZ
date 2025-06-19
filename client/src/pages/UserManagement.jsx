import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]); // ✅ make sure it's an array
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users');
        console.log(res.data.users);
        // Ensure response is an array
        if (Array.isArray(res.data.users)) {
          setUsers(res.data.users);
        } else {
          console.error('Unexpected response:', res.data.users);
          setUsers([]);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
        setError('Failed to load users');
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">User Management</h2>

      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone No</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
