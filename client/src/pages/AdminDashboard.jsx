// import { Bus, LogOut, MapPin, Route as RouteIcon, Users } from 'lucide-react';
// import { Link, Route, Routes, useLocation } from 'react-router-dom';
// import LiveMap from '../components/LiveMap';
// import { useAuth } from '../contexts/AuthContext';

// const AdminOverview = () => (
//   <div className='p-6'>
//     <h2 className='text-2xl font-bold text-gray-900 mb-6'>Dashboard Overview</h2>
//     <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
//       <StatCard icon={Bus} label='Total Buses' value='12' color='blue' />
//       <StatCard icon={Users} label='Total Students' value='450' color='green' />
//       <StatCard icon={RouteIcon} label='Active Routes' value='8' color='purple' />
//       <StatCard icon={MapPin} label='Live Tracking' value='Active' color='red' />
//     </div>
//   </div>
// );

// const StatCard = ({ icon: Icon, label, value, color }) => (
//   <div className='bg-white p-6 rounded-lg shadow'>
//     <div className='flex items-center'>
//       <Icon className={`h-8 w-8 text-${color}-600`} />
//       <div className='ml-4'>
//         <p className='text-sm font-medium text-gray-600'>{label}</p>
//         <p className='text-2xl font-bold text-gray-900'>{value}</p>
//       </div>
//     </div>
//   </div>
// );

// const BusManagement = () => (
//   <div className='p-6'>
//     <h2 className='text-2xl font-bold text-gray-900 mb-4'>Bus Management</h2>
//     <div className='bg-white rounded-lg shadow p-4 mb-6'>
//       <LiveMap />
//     </div>
//     {/* Placeholder for list or controls */}
//     <div className='bg-white rounded-lg shadow p-4'>
//       <p className='text-gray-600'>Manage and track buses here...</p>
//     </div>
//   </div>
// );

// const UserManagement = () => {
//   // Example dummy users
//   const users = [
//     { name: 'Admin One', email: 'admin1@example.com', role: 'admin' },
//     { name: 'User Two', email: 'user2@example.com', role: 'user' },
//   ];

//   return (
//     <div className='p-6'>
//       <h2 className='text-2xl font-bold text-gray-900 mb-6'>User Management</h2>
//       <div className='bg-white rounded-lg shadow p-4'>
//         <table className='min-w-full table-auto'>
//           <thead>
//             <tr>
//               <th className='text-left text-sm font-semibold text-gray-700'>Name</th>
//               <th className='text-left text-sm font-semibold text-gray-700'>Email</th>
//               <th className='text-left text-sm font-semibold text-gray-700'>Role</th>
//             </tr>
//           </thead>
//           <tbody>
//             {users.map((user, idx) => (
//               <tr key={idx} className='border-t'>
//                 <td className='py-2'>{user.name}</td>
//                 <td className='py-2'>{user.email}</td>
//                 <td className='py-2 capitalize'>{user.role}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// const AdminDashboard = () => {
//   const { user, logout } = useAuth();
//   const location = useLocation();

//   const navigation = [
//     { name: 'Bus Management', href: '/admin/buses', icon: Bus },
//     { name: 'User Management', href: '/admin/users', icon: Users },
//     { name: 'Live Tracking', href: '/admin/tracking', icon: MapPin },
//   ];

//   return (
//     <div className='min-h-screen bg-gray-100 flex'>
//       {/* Sidebar */}
//       <aside className='w-64 bg-white shadow-sm flex flex-col justify-between'>
//         <div>
//           <div className='flex items-center px-6 py-4 border-b'>
//             <Bus className='h-8 w-8 text-blue-600' />
//             <span className='ml-2 text-xl font-bold text-gray-900'>TrackEZ Admin</span>
//           </div>
//           <nav className='mt-6 px-3'>
//             {navigation.map((item) => {
//               const Icon = item.icon;
//               const isActive = location.pathname.startsWith(item.href);
//               return (
//                 <Link
//                   key={item.name}
//                   to={item.href}
//                   className={`group flex items-center px-2 py-2 text-sm font-medium mb-1 border-l-4 ${
//                     isActive
//                       ? 'bg-blue-50 border-blue-500 text-blue-700'
//                       : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
//                   }`}
//                 >
//                   <Icon className='mr-3 h-5 w-5' />
//                   {item.name}
//                 </Link>
//               );
//             })}
//           </nav>
//         </div>

//         {/* User info */}
//         <div className='p-4 border-t'>
//           <div className='flex items-center'>
//             <div className='flex-1'>
//               <p className='text-sm font-medium text-gray-900'>{user?.name}</p>
//               <p className='text-xs text-gray-500'>{user?.email}</p>
//             </div>
//             <button
//               onClick={logout}
//               className='ml-3 p-2 text-gray-400 hover:text-gray-600'
//               title='Logout'
//             >
//               <LogOut className='h-5 w-5' />
//             </button>
//           </div>
//         </div>
//       </aside>

//       {/* Main content */}
//       <main className='flex-1 overflow-y-auto'>
//         <Routes>
//           <Route path='/' element={<AdminOverview />} />
//           <Route path='/buses' element={<BusManagement />} />
//           <Route path='/users' element={<UserManagement />} />
//           <Route path='/tracking' element={<LiveMap />} />
//         </Routes>
//       </main>
//     </div>
//   );
// };

// export default AdminDashboard;



// AdminDashboard.jsx


import { Bus, LogOut, Users } from 'lucide-react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BusManagement from './BusManagement';
import UserManagement from './UserManagement';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    {
      name: 'Bus Management',
      href: '/admin/buses',
      icon: Bus,
      current: location.pathname.startsWith('/admin/buses'),
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: Users,
      current: location.pathname.startsWith('/admin/users'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm flex flex-col">
        <div className="px-6 py-4 border-b flex items-center">
          <Bus className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold">TrackEZ Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 ${
                item.current
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
        {/* Footer */}
        <div className="border-t p-4 flex justify-between">
          <div>
            <p className="text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-gray-600">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <Routes>
          <Route path="/buses" element={<BusManagement />} />
          <Route path="/users" element={<UserManagement />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminDashboard;