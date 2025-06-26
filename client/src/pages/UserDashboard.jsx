import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Bus,
    Clock,
    Home,
    LogOut,
    Mail,
    MapPin,
    Phone,
    User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

// Fix default Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bus icon - larger and more visible
const busIcon = new L.Icon({
    iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    iconSize: [50, 50], // Large bus icon
    iconAnchor: [25, 50], // Center the icon horizontally, anchor at bottom
    popupAnchor: [0, -50],
    className: 'bus-marker-icon',
});

// AutoCenter component
const AutoCenter = ({ location }) => {
    const map = useMap();
    useEffect(() => {
        if (location?.lat && location?.lng) {
            map.setView([location.lat, location.lng], 16, {
                animate: true,
            });
        }
    }, [location, map]);
    return null;
};

const UserDashboard = () => {
    const { user, logout } = useAuth();
    const [busId, setBusId] = useState(null);
    const [assignedBus, setAssignedBus] = useState(null);
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    // Get assigned bus
    useEffect(() => {
        const fetchAssignedBus = async () => {
            try {
                const res = await api.get('/buses/my-bus');
                const busData = res.data?.bus;
                if (busData?._id) {
                    setBusId(busData._id);
                    setAssignedBus(busData);
                }
            } catch (err) {
                console.error('Error fetching bus assignment:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAssignedBus();
    }, []);

    // Poll bus location every 3 seconds
    useEffect(() => {
        if (!busId) return;

        const fetchLocation = async () => {
            try {
                const res = await api.get(`/buses/${busId}/location`);
                if (res.data?.location?.lat && res.data?.location?.lng) {
                    setLocation(res.data.location);
                }
            } catch (err) {
                console.error('Error fetching bus location:', err);
            }
        };

        fetchLocation();
        const interval = setInterval(fetchLocation, 3000);
        return () => clearInterval(interval);
    }, [busId]);

    const getRoleDisplayName = (role) => {
        switch (role) {
            case 'student':
                return 'Student';
            case 'parent':
                return 'Parent';
            case 'staff':
                return 'Staff';
            default:
                return 'User';
        }
    };

    return (
        <div className='min-h-screen bg-gray-100'>
            {/* Header */}
            <header className='bg-white shadow'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex justify-between items-center py-6'>
                        <div className='flex items-center'>
                            <Bus className='h-8 w-8 text-blue-600' />
                            <h1 className='ml-2 text-2xl font-bold text-gray-900'>
                                TrackEZ {getRoleDisplayName(user?.role)}
                            </h1>
                        </div>
                        <div className='flex items-center space-x-4'>
                            <div className='flex items-center'>
                                <User className='h-5 w-5 text-gray-400 mr-2' />
                                <span className='text-sm text-gray-700'>
                                    {user?.name}
                                </span>
                            </div>
                            <button
                                onClick={logout}
                                className='flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900'
                            >
                                <LogOut className='h-4 w-4 mr-1' />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
                <div className='px-4 py-6 sm:px-0'>
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                        {/* Bus & Map */}
                        <div className='lg:col-span-2 space-y-6'>
                            <div className='bg-white shadow rounded-lg p-6'>
                                <h3 className='text-lg font-medium mb-4'>
                                    My Bus Information
                                </h3>
                                {assignedBus ? (
                                    <div className='space-y-3'>
                                        <div className='flex items-center'>
                                            <Bus className='h-5 w-5 text-blue-600 mr-2' />
                                            <span className='font-medium text-gray-900'>
                                                {assignedBus.busNumber}
                                            </span>
                                        </div>
                                        {assignedBus.driver && (
                                            <div className='text-sm text-gray-600'>
                                                Driver:{' '}
                                                {assignedBus.driver.name}
                                            </div>
                                        )}
                                        {assignedBus.route && (
                                            <div className='text-sm text-gray-600'>
                                                Route:{' '}
                                                {assignedBus.route.routeName}
                                            </div>
                                        )}
                                        <div className='text-sm text-gray-600'>
                                            Capacity: {assignedBus.capacity}{' '}
                                            passengers
                                        </div>
                                    </div>
                                ) : loading ? (
                                    <p className='text-gray-500'>
                                        Checking bus assignment...
                                    </p>
                                ) : (
                                    <div className='bg-blue-50 border border-blue-200 rounded-md p-4'>
                                        <div className='flex'>
                                            <Bus className='h-5 w-5 text-blue-400' />
                                            <div className='ml-3'>
                                                <h4 className='text-sm font-medium text-blue-800'>
                                                    No Bus Assigned
                                                </h4>
                                                <p className='text-sm text-blue-700 mt-1'>
                                                    Please contact the admin to
                                                    get assigned to a bus route.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Live Tracking Map */}
                            <div className='bg-white shadow rounded-lg p-6'>
                                <h3 className='text-lg font-medium mb-4'>
                                    Live Bus Tracking
                                </h3>
                                {location ? (
                                    <MapContainer
                                        center={[location.lat, location.lng]}
                                        zoom={16}
                                        style={{
                                            height: '500px',
                                            width: '100%',
                                        }}
                                        scrollWheelZoom={true}
                                        className='rounded-lg'
                                    >
                                        <TileLayer
                                            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                                            attribution='© OpenStreetMap contributors'
                                        />
                                        <Marker
                                            position={[
                                                location.lat,
                                                location.lng,
                                            ]}
                                            icon={busIcon}
                                        >
                                            <Popup>
                                                <div className='text-center'>
                                                    <div className='font-bold text-lg text-blue-600'>
                                                        Your Bus
                                                    </div>
                                                    <div className='text-sm text-gray-600'>
                                                        Latitude:{' '}
                                                        {location.lat.toFixed(
                                                            5
                                                        )}
                                                    </div>
                                                    <div className='text-sm text-gray-600'>
                                                        Longitude:{' '}
                                                        {location.lng.toFixed(
                                                            5
                                                        )}
                                                    </div>
                                                </div>
                                            </Popup>
                                        </Marker>
                                        <AutoCenter location={location} />
                                    </MapContainer>
                                ) : busId ? (
                                    <div className='bg-gray-100 rounded-lg h-[500px] flex items-center justify-center'>
                                        <div className='text-center'>
                                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2'></div>
                                            <p className='text-gray-500'>
                                                Loading location...
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='bg-gray-100 rounded-lg h-[500px] flex items-center justify-center'>
                                        <div className='text-center'>
                                            <MapPin className='h-12 w-12 text-gray-400 mx-auto mb-2' />
                                            <p className='text-gray-500'>
                                                Map will appear when a bus is
                                                assigned.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className='space-y-6'>
                            <div className='bg-white shadow rounded-lg p-6'>
                                <h3 className='text-lg font-medium mb-4'>
                                    Profile Information
                                </h3>
                                <dl className='space-y-3'>
                                    <div>
                                        <dt className='text-sm font-medium text-gray-500'>
                                            Name
                                        </dt>
                                        <dd className='text-sm text-gray-900'>
                                            {user?.name}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className='text-sm font-medium text-gray-500'>
                                            Role
                                        </dt>
                                        <dd className='text-sm text-gray-900'>
                                            {getRoleDisplayName(user?.role)}
                                        </dd>
                                    </div>
                                    {user?.studentId && (
                                        <div>
                                            <dt className='text-sm font-medium text-gray-500'>
                                                Student ID
                                            </dt>
                                            <dd className='text-sm text-gray-900'>
                                                {user.studentId}
                                            </dd>
                                        </div>
                                    )}
                                    <div>
                                        <dt className='text-sm font-medium text-gray-500'>
                                            Email
                                        </dt>
                                        <dd className='text-sm text-gray-900'>
                                            {user?.email}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className='text-sm font-medium text-gray-500'>
                                            Status
                                        </dt>
                                        <dd className='text-sm text-green-600'>
                                            Active
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            <div className='bg-white shadow rounded-lg p-6'>
                                <h3 className='text-lg font-medium mb-4'>
                                    Quick Actions
                                </h3>
                                <div className='space-y-2'>
                                    <button className='w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md'>
                                        <Home className='h-4 w-4 mr-2' />
                                        View Schedule
                                    </button>
                                    <button className='w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md'>
                                        <Phone className='h-4 w-4 mr-2' />
                                        Contact Support
                                    </button>
                                    <button className='w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md'>
                                        <Mail className='h-4 w-4 mr-2' />
                                        Send Feedback
                                    </button>
                                </div>
                            </div>

                            <div className='bg-white shadow rounded-lg p-6'>
                                <h3 className='text-lg font-medium mb-4'>
                                    Recent Activity
                                </h3>
                                <div className='text-center py-4'>
                                    <Clock className='h-8 w-8 text-gray-400 mx-auto mb-2' />
                                    <p className='text-sm text-gray-500'>
                                        No recent activity
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;
