import { Bus, Edit, Plus, Trash, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const DriverManagement = () => {
    const [drivers, setDrivers] = useState([]);
    const [buses, setBuses] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        licenseNumber: '',
        assignedBusId: '',
    });

    useEffect(() => {
        fetchDrivers();
        fetchBuses();
    }, []);

    const fetchDrivers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/drivers');
            setDrivers(response.data || []);
        } catch (err) {
            setError(
                'Failed to load drivers: ' +
                    (err.response?.data?.message || err.message)
            );
            console.error('Error fetching drivers:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBuses = async () => {
        try {
            const response = await api.get('/buses');
            setBuses(response.data.buses || []);
        } catch (err) {
            console.error('Error fetching buses:', err);
        }
    };

    // Add Driver Functions
    const handleAddDriver = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            licenseNumber: '',
            assignedBusId: '',
        });
        setShowAddModal(true);
    };

    const submitAddDriver = async (e) => {
        e.preventDefault();
        try {
            const { assignedBusId, ...driverData } = formData;
            const response = await api.post('/drivers', driverData);

            // If a bus is assigned, update the bus with the new driver
            if (assignedBusId) {
                await api.put(`/buses/${assignedBusId}`, {
                    driverId: response.data._id,
                });
            }

            await fetchDrivers(); // Refresh to get updated bus assignments
            setShowAddModal(false);
            setFormData({
                name: '',
                email: '',
                phone: '',
                licenseNumber: '',
                assignedBusId: '',
            });
        } catch (err) {
            setError(
                'Failed to add driver: ' +
                    (err.response?.data?.message || err.message)
            );
        }
    };

    // Edit Driver Functions
    const handleEditDriver = (driver) => {
        setSelectedDriver(driver);
        setFormData({
            name: driver.name || '',
            email: driver.email || '',
            phone: driver.phone || '',
            licenseNumber: driver.licenseNumber || '',
            assignedBusId: driver.assignedBus?._id || '',
        });
        setShowEditModal(true);
    };

    const submitEditDriver = async (e) => {
        e.preventDefault();
        try {
            const { assignedBusId, ...driverData } = formData;
            const response = await api.put(
                `/drivers/${selectedDriver._id}`,
                driverData
            );

            // Update bus assignment
            if (assignedBusId !== (selectedDriver.assignedBus?._id || '')) {
                // Remove driver from current bus if any
                if (selectedDriver.assignedBus?._id) {
                    await api.put(`/buses/${selectedDriver.assignedBus._id}`, {
                        driverId: '',
                    });
                }

                // Assign driver to new bus if selected
                if (assignedBusId) {
                    await api.put(`/buses/${assignedBusId}`, {
                        driverId: selectedDriver._id,
                    });
                }
            }

            await fetchDrivers(); // Refresh to get updated bus assignments
            setShowEditModal(false);
            setSelectedDriver(null);
        } catch (err) {
            setError(
                'Failed to update driver: ' +
                    (err.response?.data?.message || err.message)
            );
        }
    };

    // Delete Driver Functions
    const handleDeleteDriver = (driver) => {
        setSelectedDriver(driver);
        setShowDeleteModal(true);
    };

    const confirmDeleteDriver = async () => {
        try {
            // Remove driver from assigned bus first
            if (selectedDriver.assignedBus?._id) {
                await api.put(`/buses/${selectedDriver.assignedBus._id}`, {
                    driverId: '',
                });
            }

            await api.delete(`/drivers/${selectedDriver._id}`);
            setDrivers(
                drivers.filter((driver) => driver._id !== selectedDriver._id)
            );
            setShowDeleteModal(false);
            setSelectedDriver(null);
        } catch (err) {
            setError(
                'Failed to delete driver: ' +
                    (err.response?.data?.message || err.message)
            );
        }
    };

    const getAvailableBuses = () => {
        return buses.filter(
            (bus) => !bus.driver || bus.driver === selectedDriver?._id
        );
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
                    Driver Management
                </h2>
                <button
                    onClick={handleAddDriver}
                    className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
                >
                    <Plus className='w-4 h-4 mr-2' />
                    Add Driver
                </button>
            </div>

            {error && (
                <div className='mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg'>
                    {error}
                </div>
            )}

            {/* Drivers List */}
            <div className='bg-white shadow rounded-lg overflow-hidden'>
                <div className='p-4 border-b bg-gray-50'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                        Drivers
                    </h3>
                </div>
                <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200'>
                        <thead className='bg-gray-100'>
                            <tr>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider'>
                                    Driver
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider'>
                                    Contact
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider'>
                                    License
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider'>
                                    Assigned Bus
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider'>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className='bg-white divide-y divide-gray-200'>
                            {drivers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan='5'
                                        className='px-6 py-4 text-center text-gray-500'
                                    >
                                        No drivers found
                                    </td>
                                </tr>
                            ) : (
                                drivers.map((driver) => (
                                    <tr
                                        key={driver._id}
                                        className='hover:bg-gray-50'
                                    >
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <div className='flex items-center'>
                                                <User className='w-4 h-4 mr-2 text-blue-600' />
                                                <span className='font-medium text-gray-900'>
                                                    {driver.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <div className='text-sm text-gray-900'>
                                                <div>{driver.email}</div>
                                                <div className='text-gray-500'>
                                                    {driver.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                                            {driver.licenseNumber}
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            {driver.assignedBus ? (
                                                <div className='flex items-center'>
                                                    <Bus className='w-4 h-4 mr-2 text-green-600' />
                                                    <div>
                                                        <div className='text-sm font-medium text-gray-900'>
                                                            {
                                                                driver
                                                                    .assignedBus
                                                                    .busNumber
                                                            }
                                                        </div>
                                                        <div className='text-xs text-gray-500'>
                                                            Capacity:{' '}
                                                            {
                                                                driver
                                                                    .assignedBus
                                                                    .capacity
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className='text-sm text-gray-500 italic'>
                                                    No bus assigned
                                                </span>
                                            )}
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                            <div className='flex space-x-2'>
                                                <button
                                                    onClick={() =>
                                                        handleEditDriver(driver)
                                                    }
                                                    className='text-blue-600 hover:text-blue-900'
                                                    title='Edit Driver'
                                                >
                                                    <Edit className='w-4 h-4' />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteDriver(
                                                            driver
                                                        )
                                                    }
                                                    className='text-red-600 hover:text-red-900'
                                                    title='Delete Driver'
                                                >
                                                    <Trash className='w-4 h-4' />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Driver Modal */}
            {showAddModal && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]'>
                    <div className='bg-white rounded-lg p-6 w-full max-w-md'>
                        <h3 className='text-lg font-semibold mb-4'>
                            Add New Driver
                        </h3>
                        <form onSubmit={submitAddDriver}>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Name *
                                </label>
                                <input
                                    type='text'
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Email *
                                </label>
                                <input
                                    type='email'
                                    required
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Phone *
                                </label>
                                <input
                                    type='tel'
                                    required
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            phone: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    License Number *
                                </label>
                                <input
                                    type='text'
                                    required
                                    value={formData.licenseNumber}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            licenseNumber: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                            <div className='mb-6'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Assign Bus
                                </label>
                                <select
                                    value={formData.assignedBusId}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            assignedBusId: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                >
                                    <option value=''>No bus assignment</option>
                                    {getAvailableBuses().map((bus) => (
                                        <option key={bus._id} value={bus._id}>
                                            {bus.busNumber} (Capacity:{' '}
                                            {bus.capacity})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='flex gap-3'>
                                <button
                                    type='submit'
                                    className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'
                                >
                                    Add Driver
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

            {/* Edit Driver Modal */}
            {showEditModal && selectedDriver && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]'>
                    <div className='bg-white rounded-lg p-6 w-full max-w-md'>
                        <h3 className='text-lg font-semibold mb-4'>
                            Edit Driver
                        </h3>
                        <form onSubmit={submitEditDriver}>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Name *
                                </label>
                                <input
                                    type='text'
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Email *
                                </label>
                                <input
                                    type='email'
                                    required
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Phone *
                                </label>
                                <input
                                    type='tel'
                                    required
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            phone: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                            <div className='mb-4'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    License Number *
                                </label>
                                <input
                                    type='text'
                                    required
                                    value={formData.licenseNumber}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            licenseNumber: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                            </div>
                            <div className='mb-6'>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Assign Bus
                                </label>
                                <select
                                    value={formData.assignedBusId}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            assignedBusId: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                >
                                    <option value=''>No bus assignment</option>
                                    {getAvailableBuses().map((bus) => (
                                        <option key={bus._id} value={bus._id}>
                                            {bus.busNumber} (Capacity:{' '}
                                            {bus.capacity})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='flex gap-3'>
                                <button
                                    type='submit'
                                    className='flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700'
                                >
                                    Update Driver
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
            {showDeleteModal && selectedDriver && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]'>
                    <div className='bg-white rounded-lg p-6 w-full max-w-md'>
                        <h3 className='text-lg font-semibold mb-4 text-red-600'>
                            Delete Driver
                        </h3>
                        <p className='mb-6 text-gray-700'>
                            Are you sure you want to delete driver{' '}
                            <strong>{selectedDriver.name}</strong>?
                            {selectedDriver.assignedBus && (
                                <span className='block mt-2 text-sm text-orange-600'>
                                    This will also remove them from bus{' '}
                                    {selectedDriver.assignedBus.busNumber}.
                                </span>
                            )}
                            This action cannot be undone.
                        </p>
                        <div className='flex gap-3'>
                            <button
                                onClick={confirmDeleteDriver}
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

export default DriverManagement;
