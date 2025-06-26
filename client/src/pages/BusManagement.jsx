import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LiveMap from '../components/LiveMap';
import { api } from '../services/api';

const BusManagement = () => {
    const location = useLocation();
    const [buses, setBuses] = useState([]); // ✅ must be an array
    const [selectedBusId, setSelectedBusId] = useState(null);
    const [error, setError] = useState('');
    const [drivers, setDrivers] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBus, setSelectedBus] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        busNumber: '',
        capacity: '',
        driverId: '',
        routeId: '',
    });

    useEffect(() => {
        console.log(
            'BusManagement component mounted, current path:',
            location.pathname
        );
        fetchBuses();
        fetchDrivers();
        fetchRoutes();
    }, [location.pathname]);

    const fetchBuses = async () => {
        try {
            setLoading(true);
            const res = await api.get('/buses');
            if (Array.isArray(res.data.buses)) {
                setBuses(res.data.buses);
                setSelectedBusId(res.data.buses[0]?._id || null); // default select first bus
            } else {
                console.error('Invalid bus response:', res.data);
                setBuses([]);
            }
        } catch (err) {
            setError(
                'Failed to load buses: ' +
                    (err.response?.data?.message || err.message)
            );
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDrivers = async () => {
        try {
            const response = await api.get('/drivers');
            setDrivers(response.data || []);
        } catch (err) {
            console.error('Error fetching drivers:', err);
        }
    };

    const fetchRoutes = async () => {
        try {
            const response = await api.get('/routes');
            setRoutes(response.data || []);
        } catch (err) {
            console.error('Error fetching routes:', err);
        }
    };

    const getDriverName = (bus) => {
        if (bus.driver) {
            if (typeof bus.driver === 'object' && bus.driver.name) {
                return bus.driver.name;
            }
            const driver = drivers.find((d) => d._id === bus.driver);
            return driver ? driver.name : 'Unknown Driver';
        }
        return 'No Driver Assigned';
    };

    const getRouteName = (bus) => {
        if (bus.route) {
            if (typeof bus.route === 'object' && bus.route.routeName) {
                return bus.route.routeName;
            }
            return 'Route ID: ' + bus.route;
        }
        return 'No Route Assigned';
    };

    const getStudentCount = (bus) => {
        if (bus.students && Array.isArray(bus.students)) {
            return bus.students.length;
        }
        return 0;
    };

    const getLocationStatus = (bus) => {
        if (
            bus.currentLocation &&
            bus.currentLocation.latitude &&
            bus.currentLocation.longitude
        ) {
            return 'Active';
        }
        return 'No Location';
    };

    // Add Bus Functions
    const handleAddBus = () => {
        setFormData({
            busNumber: '',
            capacity: '',
            driverId: '',
            routeId: '',
        });
        setShowAddModal(true);
    };

    const submitAddBus = async (e) => {
        e.preventDefault();
        console.log('Adding bus with data:', formData);
        try {
            const response = await api.post('/buses', formData);
            console.log('Bus added successfully:', response.data);
            setBuses([...buses, response.data.bus]);
            // Refresh drivers data to get updated assignments
            await fetchDrivers();
            setShowAddModal(false);
            setFormData({
                busNumber: '',
                capacity: '',
                driverId: '',
                routeId: '',
            });
            setError(''); // Clear any previous errors
        } catch (err) {
            console.error('Error adding bus:', err);
            setError(
                'Failed to add bus: ' +
                    (err.response?.data?.message || err.message)
            );
        }
    };

    // Edit Bus Functions
    const handleEditBus = (bus) => {
        setSelectedBus(bus);
        setFormData({
            busNumber: bus.busNumber || '',
            capacity: bus.capacity || '',
            driverId: bus.driver?._id || bus.driver || '',
            routeId: bus.route?._id || bus.route || '',
        });
        setShowEditModal(true);
    };

    const submitEditBus = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put(
                `/buses/${selectedBus._id}`,
                formData
            );
            setBuses(
                buses.map((bus) =>
                    bus._id === selectedBus._id ? response.data.bus : bus
                )
            );
            // Refresh drivers data to get updated driver names
            await fetchDrivers();
            setShowEditModal(false);
            setSelectedBus(null);
        } catch (err) {
            setError(
                'Failed to update bus: ' +
                    (err.response?.data?.message || err.message)
            );
        }
    };

    // Delete Bus Functions
    const handleDeleteBus = (bus) => {
        setSelectedBus(bus);
        setShowDeleteModal(true);
    };

    const confirmDeleteBus = async () => {
        try {
            await api.delete(`/buses/${selectedBus._id}`);
            setBuses(buses.filter((bus) => bus._id !== selectedBus._id));
            setShowDeleteModal(false);
            setSelectedBus(null);
        } catch (err) {
            setError(
                'Failed to delete bus: ' +
                    (err.response?.data?.message || err.message)
            );
        }
    };

    if (loading) {
        return (
            <div className='p-6'>
                <div className='flex items-center justify-center h-64'>
                    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
                </div>
            </div>
        );
    }

    return (
        <div className='p-6'>
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>
                    Bus Management
                </h2>
                <button
                    onClick={handleAddBus}
                    className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'
                >
                    <span>+</span> Add New Bus
                </button>
            </div>

            {error && <p className='text-red-500 mb-4'>{error}</p>}

            {/* Bus List */}
            <div className='bg-white shadow rounded mb-6 overflow-hidden'>
                <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-100'>
                        <tr>
                            <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>
                                Bus Number
                            </th>
                            <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>
                                Capacity
                            </th>
                            <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>
                                Driver
                            </th>
                            <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>
                                Route
                            </th>
                            <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>
                                Students
                            </th>
                            <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>
                                Status
                            </th>
                            <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>
                                Location
                            </th>
                            <th className='px-6 py-3 text-left text-sm font-semibold text-gray-700'>
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200 bg-white'>
                        {buses.length === 0 ? (
                            <tr>
                                <td
                                    colSpan='8'
                                    className='px-6 py-4 text-center text-gray-500'
                                >
                                    No buses found
                                </td>
                            </tr>
                        ) : (
                            buses.map((bus) => (
                                <tr key={bus._id} className='hover:bg-gray-50'>
                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <span className='font-medium text-gray-900'>
                                            {bus.busNumber || 'Unnamed Bus'}
                                        </span>
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                                        {bus.capacity || 'N/A'}
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                                        {getDriverName(bus)}
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                                        {getRouteName(bus)}
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                                        {getStudentCount(bus)} /{' '}
                                        {bus.capacity || 'N/A'}
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                bus.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {bus.isActive
                                                ? 'Active'
                                                : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap text-gray-700'>
                                        {getLocationStatus(bus)}
                                    </td>
                                    <td className='px-6 py-4 whitespace-nowrap'>
                                        <div className='flex gap-2'>
                                            
                                            <button
                                                onClick={() =>
                                                    handleEditBus(bus)
                                                }
                                                className='text-green-600 hover:text-green-800 hover:underline font-medium'
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDeleteBus(bus)
                                                }
                                                className='text-red-600 hover:text-red-800 hover:underline font-medium'
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Live Map */}
            {selectedBusId && (
                <div className='bg-white p-4 rounded shadow'>
                    <h3 className='text-lg font-semibold mb-2'>
                        Live Location for Selected Bus
                    </h3>
                    <LiveMap busId={selectedBusId} />
                </div>
            )}

            {/* Add Bus Modal */}
            {showAddModal && (
                <div
                    key='add-bus-modal'
                    className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]'
                >
                    <div className='bg-white rounded-lg p-6 w-full max-w-md'>
                        <h3 className='text-lg font-semibold mb-4'>
                            Add New Bus
                        </h3>
                        <form onSubmit={submitAddBus}>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Bus Number *
                                </label>
                                <input
                                    type='text'
                                    required
                                    value={formData.busNumber}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            busNumber: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Capacity *
                                </label>
                                <input
                                    type='number'
                                    required
                                    min='1'
                                    value={formData.capacity}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            capacity: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Driver
                                </label>
                                <select
                                    value={formData.driverId}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            driverId: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                >
                                    <option value=''>Select Driver</option>
                                    {drivers.map((driver) => (
                                        <option
                                            key={driver._id}
                                            value={driver._id}
                                        >
                                            {driver.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='mb-6'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Route
                                </label>
                                <select
                                    value={formData.routeId}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            routeId: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                >
                                    <option value=''>Select Route</option>
                                    {routes.map((route) => (
                                        <option
                                            key={route._id}
                                            value={route._id}
                                        >
                                            {route.routeName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='flex gap-3'>
                                <button
                                    type='submit'
                                    className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'
                                >
                                    Add Bus
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setShowAddModal(false)}
                                    className='flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400'
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Bus Modal */}
            {showEditModal && selectedBus && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]'>
                    <div className='bg-white rounded-lg p-6 w-full max-w-md'>
                        <h3 className='text-lg font-semibold mb-4'>Edit Bus</h3>
                        <form onSubmit={submitEditBus}>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Bus Number *
                                </label>
                                <input
                                    type='text'
                                    required
                                    value={formData.busNumber}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            busNumber: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Capacity *
                                </label>
                                <input
                                    type='number'
                                    required
                                    min='1'
                                    value={formData.capacity}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            capacity: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Driver
                                </label>
                                <select
                                    value={formData.driverId}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            driverId: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                >
                                    <option value=''>Select Driver</option>
                                    {drivers.map((driver) => (
                                        <option
                                            key={driver._id}
                                            value={driver._id}
                                        >
                                            {driver.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='mb-6'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Route
                                </label>
                                <select
                                    value={formData.routeId}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            routeId: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                >
                                    <option value=''>Select Route</option>
                                    {routes.map((route) => (
                                        <option
                                            key={route._id}
                                            value={route._id}
                                        >
                                            {route.routeName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='flex gap-3'>
                                <button
                                    type='submit'
                                    className='flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700'
                                >
                                    Update Bus
                                </button>
                                <button
                                    type='button'
                                    onClick={() => setShowEditModal(false)}
                                    className='flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400'
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedBus && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]'>
                    <div className='bg-white rounded-lg p-6 w-full max-w-md'>
                        <h3 className='text-lg font-semibold mb-4 text-red-600'>
                            Delete Bus
                        </h3>
                        <p className='mb-6 text-gray-700'>
                            Are you sure you want to delete bus{' '}
                            <strong>{selectedBus.busNumber}</strong>? This
                            action cannot be undone.
                        </p>
                        <div className='flex gap-3'>
                            <button
                                onClick={confirmDeleteBus}
                                className='flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700'
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className='flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400'
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusManagement;
