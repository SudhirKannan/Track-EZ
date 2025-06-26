import { Bus, LogOut, UserCheck, Users } from 'lucide-react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import BusManagement from './BusManagement';
import DriverManagement from './DriverManagement';
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
            name: 'Driver Management',
            href: '/admin/drivers',
            icon: UserCheck,
            current: location.pathname.startsWith('/admin/drivers'),
        },
        {
            name: 'User Management',
            href: '/admin/users',
            icon: Users,
            current: location.pathname.startsWith('/admin/users'),
        },
    ];

    return (
        <div className='min-h-screen bg-gray-100 flex'>
            {/* Sidebar */}
            <aside className='w-64 bg-white shadow-sm flex flex-col'>
                <div className='px-6 py-4 border-b flex items-center'>
                    <Bus className='h-8 w-8 text-blue-600' />
                    <span className='ml-2 text-xl font-bold'>
                        TrackEZ Admin
                    </span>
                </div>
                <nav className='flex-1 px-3 py-4'>
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
                            <item.icon className='mr-3 h-5 w-5' />
                            {item.name}
                        </Link>
                    ))}
                </nav>
                {/* Footer */}
                <div className='border-t p-4 flex justify-between'>
                    <div>
                        <p className='text-sm font-medium'>{user?.name}</p>
                        <p className='text-xs text-gray-500'>{user?.email}</p>
                    </div>
                    <button
                        onClick={logout}
                        className='text-gray-400 hover:text-gray-600'
                    >
                        <LogOut className='h-5 w-5' />
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className='flex-1'>
                <Routes>
                    <Route
                        path='/'
                        element={<Navigate to='/admin/buses' replace />}
                    />
                    <Route path='/buses' element={<BusManagement />} />
                    <Route path='/drivers' element={<DriverManagement />} />
                    <Route path='/users' element={<UserManagement />} />
                </Routes>
            </main>
        </div>
    );
};

export default AdminDashboard;
