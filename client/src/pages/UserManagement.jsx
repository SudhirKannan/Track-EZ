// // import React, { useEffect, useState } from 'react';
// // import { api } from '../services/api';

// // const UserManagement = () => {
// //   const [users, setUsers] = useState([]); // ✅ make sure it's an array
// //   const [error, setError] = useState(null);

// //   useEffect(() => {
// //     const fetchUsers = async () => {
// //       try {
// //         const res = await api.get('/users');
// //         console.log(res.data.users);
// //         // Ensure response is an array
// //         if (Array.isArray(res.data.users)) {
// //           setUsers(res.data.users);
// //         } else {
// //           console.error('Unexpected response:', res.data.users);
// //           setUsers([]);
// //         }
// //       } catch (err) {
// //         console.error('Failed to fetch users:', err);
// //         setError('Failed to load users');
// //       }
// //     };

// //     fetchUsers();
// //   }, []);

// //   return (
// //     <div className="p-6">
// //       <h2 className="text-2xl font-bold mb-4">User Management</h2>

// //       {error && <p className="text-red-500">{error}</p>}

// //       <div className="bg-white shadow rounded-lg overflow-hidden">
// //         <table className="min-w-full divide-y divide-gray-200">
// //           <thead className="bg-gray-100">
// //             <tr>
// //               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
// //               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
// //               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
// //               <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone No</th>
// //             </tr>
// //           </thead>
// //           <tbody className="divide-y divide-gray-200">
// //             {users.map((user) => (
// //               <tr key={user._id}>
// //                 <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
// //                 <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
// //                 <td className="px-6 py-4 whitespace-nowrap capitalize">{user.role}</td>
// //                 <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   );
// // };

// // export default UserManagement;


// import React, { useState, useEffect } from 'react';
// import { api } from '../services/api';
// import { useAuth } from '../contexts/AuthContext';
// import { Trash2, UserPlus } from 'lucide-react';

// const UserManagement = () => {
//   const { user } = useAuth();
//   const [users, setUsers] = useState([]);
//   const [buses, setBuses] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchAll = async () => {
//       try {
//         const [uRes, bRes] = await Promise.all([
//           api.get('/users'),
//           api.get('/buses'),
//         ]);
//         setUsers(Array.isArray(uRes.data.users) ? uRes.data.users : uRes.data);
//         setBuses(Array.isArray(bRes.data.buses) ? bRes.data.buses : bRes.data);
//       } catch (err) {
//         console.error('Fetch error', err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchAll();
//   }, []);

//   const handleDelete = async (userId) => {
//     if (!window.confirm('Delete this user?')) return;
//     try {
//       await api.delete(`/users/${userId}`);
//       setUsers(users.filter((u) => u._id !== userId));
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const handleAssign = async (userId, busId) => {
//     try {
//       await api.post('/users/assign-bus', { userId, busId });
//       setUsers(users.map(u => u._id === userId ? { ...u, assignedBus: busId } : u));
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div className="p-6 bg-white rounded-lg shadow">
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-xl font-semibold">User Management</h2>
//         <button
//           className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
//           onClick={() => alert('Add user form not implemented yet')}
//         >
//           <UserPlus className="mr-1" /> Add User
//         </button>
//       </div>

//       <table className="w-full table-auto">
//         <thead className="bg-gray-100">
//           <tr>
//             <th className="p-2 text-left">Name</th>
//             <th className="p-2 text-left">Email</th>
//             <th className="p-2 text-left">Role</th>
//             <th className="p-2 text-left">Assigned Bus</th>
//             <th className="p-2 text-center">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {users.map((u) => (
//             <tr key={u._id} className="border-t">
//               <td className="p-2">{u.name}</td>
//               <td className="p-2">{u.email}</td>
//               <td className="p-2 capitalize">{u.role}</td>
//               <td className="p-2">
//                 {u.assignedBus?.busNumber || (
//                   <select
//                     onChange={e => handleAssign(u._id, e.target.value)}
//                     className="border p-1 rounded"
//                     defaultValue=""
//                   >
//                     <option value="" disabled>Assign Bus</option>
//                     {buses.map(b => (
//                       <option key={b._id} value={b._id}>
//                         {b.busNumber}
//                       </option>
//                     ))}
//                   </select>
//                 )}
//               </td>
//               <td className="p-2 text-center">
//                 {user._id !== u._id && (
//                   <button
//                     className="text-red-600 hover:text-red-800"
//                     onClick={() => handleDelete(u._id)}
//                   >
//                     <Trash2 />
//                   </button>
//                 )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default UserManagement;


import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, UserPlus } from 'lucide-react';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [uRes, bRes] = await Promise.all([
          api.get('/users'),
          api.get('/buses'),
        ]);
        setUsers(Array.isArray(uRes.data.users) ? uRes.data.users : uRes.data);
        setBuses(Array.isArray(bRes.data.buses) ? bRes.data.buses : bRes.data);
      } catch (err) {
        console.error('Fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter((u) => u._id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async (userId, busId) => {
  try {
    const updatedBusId = busId;

    await api.put(`/users/${userId}/assign-bus`, { busId: updatedBusId });

    // Refresh user list so UI updates
    const res = await api.get('/auth/users');
    setUsers(res.data.users);
  } catch (err) {
    console.error('Failed to assign/unassign bus:', err.response?.data?.message || err.message);
  }
};


  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', formData);
      setUsers([...users, res.data.user]);
      setFormData({ name: '', email: '', password: '', role: 'student' });
      setShowForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding user');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">User Management</h2>
        <button
          className="flex items-center px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => setShowForm(!showForm)}
        >
          <UserPlus className="mr-1" /> Add User
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddUser} className="bg-gray-50 p-4 mb-6 rounded border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="border p-2 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="border p-2 rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="border p-2 rounded"
            />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="border p-2 rounded"
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="driver">Driver</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create User
          </button>
        </form>
      )}

      <table className="w-full table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Role</th>
            <th className="p-2 text-left">Assigned Bus</th>
            <th className="p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
  <tr key={u._id} className="border-t">
    <td className="p-2">{u.name}</td>
    <td className="p-2">{u.email}</td>
    <td className="p-2 capitalize">{u.role}</td>
    <td className="p-2">
      <select
        onChange={e => handleAssign(u._id, e.target.value)}
        className="border p-1 rounded"
        value={u.assignedBus?._id || ''}
      >
        <option value='' disabled>Assign Bus</option>
        {buses.map(b => (
          <option key={b._id} value={b._id}>
            {b.busNumber}
          </option>
        ))}
      </select>
    </td>
    <td className="p-2 text-center">
      {user._id !== u._id && (
        <button
          className="text-red-600 hover:text-red-800"
          onClick={() => handleDelete(u._id)}
        >
          <Trash2 />
        </button>
      )}
    </td>
  </tr>
))}

        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
