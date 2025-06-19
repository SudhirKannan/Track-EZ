import { Bus, LogOut, MapPin, Route as RouteIcon, Users } from 'lucide-react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import LiveMap from '../components/LiveMap';
import { useAuth } from '../contexts/AuthContext';

// Admin Dashboard Components (placeholder for now)
const AdminOverview = () => (
    <div className='p-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-6'>
            Dashboard Overview
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <div className='bg-white p-6 rounded-lg shadow'>
                <div className='flex items-center'>
                    <Bus className='h-8 w-8 text-blue-600' />
                    <div className='ml-4'>
                        <p className='text-sm font-medium text-gray-600'>
                            Total Buses
                        </p>
                        <p className='text-2xl font-bold text-gray-900'>12</p>
                    </div>
                </div>
            </div>
            <div className='bg-white p-6 rounded-lg shadow'>
                <div className='flex items-center'>
                    <Users className='h-8 w-8 text-green-600' />
                    <div className='ml-4'>
                        <p className='text-sm font-medium text-gray-600'>
                            Total Students
                        </p>
                        <p className='text-2xl font-bold text-gray-900'>450</p>
                    </div>
                </div>
            </div>
            <div className='bg-white p-6 rounded-lg shadow'>
                <div className='flex items-center'>
                    <RouteIcon className='h-8 w-8 text-purple-600' />
                    <div className='ml-4'>
                        <p className='text-sm font-medium text-gray-600'>
                            Active Routes
                        </p>
                        <p className='text-2xl font-bold text-gray-900'>8</p>
                    </div>
                </div>
            </div>
            <div className='bg-white p-6 rounded-lg shadow'>
                <div className='flex items-center'>
                    <MapPin className='h-8 w-8 text-red-600' />
                    <div className='ml-4'>
                        <p className='text-sm font-medium text-gray-600'>
                            Live Tracking
                        </p>
                        <p className='text-2xl font-bold text-gray-900'>
                            Active
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const BusManagement = () => (
    <div className='p-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-6'>
            Bus Management
        </h2>
        <div className='bg-white rounded-lg shadow p-6'>
            <p className='text-gray-600'>
                Bus management features coming soon...
            </p>
        </div>
    </div>
);

const UserManagement = () => (
    <div className='p-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-6'>
            User Management
        </h2>
        <div className='bg-white rounded-lg shadow p-6'>
            <p className='text-gray-600'>
                User management features coming soon...
            </p>
        </div>
    </div>
);

const LiveTracking = () => (
    <div className='p-6'>
        <h2 className='text-2xl font-bold text-gray-900 mb-6'>
            Live Bus Tracking
        </h2>
        <div className='bg-white rounded-lg shadow p-6'>
            <p className='text-gray-600'>Live tracking map coming soon...</p>
        </div>
    </div>
);

const AdminDashboard = () => {
    const dummyBusId = '507f1f77bcf86cd799439011';
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
            current: location.pathname === '/admin/users',
        },
        {
            name: 'Live Tracking',
            href: '/admin/tracking',
            icon: MapPin,
            current: location.pathname === '/admin/tracking',
        },
    ];

    return (
        <div className='min-h-screen bg-gray-100 flex'>
            {/* Sidebar */}
            <div className='w-64 bg-white shadow-sm'>
                <div className='flex items-center px-6 py-4 border-b'>
                    <Bus className='h-8 w-8 text-blue-600' />
                    <span className='ml-2 text-xl font-bold text-gray-900'>
                        TrackEZ Admin
                    </span>
                </div>
                <nav className='mt-6'>
                    <div className='px-3'>
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`${
                                        item.current
                                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    } group flex items-center px-2 py-2 text-sm font-medium border-l-4 mb-1`}
                                >
                                    <Icon className='mr-3 h-5 w-5' />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User info and logout */}
                <div className='absolute bottom-0 w-64 p-4 border-t'>
                    <div className='flex items-center'>
                        <div className='flex-1'>
                            <p className='text-sm font-medium text-gray-900'>
                                {user?.name}
                            </p>
                            <p className='text-xs text-gray-500'>
                                {user?.email}
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className='ml-3 p-2 text-gray-400 hover:text-gray-600'
                            title='Logout'
                        >
                            <LogOut className='h-5 w-5' />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className='flex-1'>
                                <LiveMap busId={dummyBusId} />

                <Routes>
                    <Route path='/' element={<AdminOverview />} />
                    <Route path='/buses' element={<BusManagement />} />
                    <Route path='/users' element={<UserManagement />} />
                    <Route path='/tracking' element={<LiveTracking />} />
                </Routes>
            </div>
        </div>
    );
};

export default AdminDashboard;
