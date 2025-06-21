import { Edit, Plus, Trash, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const DriverManagement = () => {
    const [drivers, setDrivers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingDriver, setEditingDriver] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        licenseNumber: '',
    });

    useEffect(() => {
        fetchDrivers();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDriver) {
                // Update existing driver
                const response = await api.put(
                    `/drivers/${editingDriver._id}`,
                    formData
                );
                setDrivers(
                    drivers.map((driver) =>
                        driver._id === editingDriver._id
                            ? response.data
                            : driver
                    )
                );
                setEditingDriver(null);
            } else {
                // Create new driver
                const response = await api.post('/drivers', formData);
                setDrivers([...drivers, response.data]);
            }

            setFormData({ name: '', email: '', phone: '', licenseNumber: '' });
            setShowForm(false);
            setError('');
        } catch (err) {
            setError(
                'Failed to save driver: ' +
                    (err.response?.data?.message || err.message)
            );
            console.error('Error saving driver:', err);
        }
    };

    const handleEdit = (driver) => {
        setEditingDriver(driver);
        setFormData({
            name: driver.name || '',
            email: driver.email || '',
            phone: driver.phone || '',
            licenseNumber: driver.licenseNumber || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (driverId) => {
        if (!window.confirm('Are you sure you want to delete this driver?')) {
            return;
        }

        try {
            await api.delete(`/drivers/${driverId}`);
            setDrivers(drivers.filter((driver) => driver._id !== driverId));
            setError('');
        } catch (err) {
            setError(
                'Failed to delete driver: ' +
                    (err.response?.data?.message || err.message)
            );
            console.error('Error deleting driver:', err);
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
                    Driver Management
                </h2>
                <button
                    onClick={() => {
                        setEditingDriver(null);
                        setFormData({
                            name: '',
                            email: '',
                            phone: '',
                            licenseNumber: '',
                        });
                        setShowForm(true);
                    }}
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

            {/* Add/Edit Driver Form */}
            {showForm && (
                <div className='mb-6 bg-white p-6 rounded-lg shadow'>
                    <h3 className='text-lg font-semibold mb-4'>
                        {editingDriver ? 'Edit Driver' : 'Add New Driver'}
                    </h3>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Name
                                </label>
                                <input
                                    type='text'
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    required
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Email
                                </label>
                                <input
                                    type='email'
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            email: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    required
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    Phone
                                </label>
                                <input
                                    type='tel'
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            phone: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    required
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>
                                    License Number
                                </label>
                                <input
                                    type='text'
                                    value={formData.licenseNumber}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            licenseNumber: e.target.value,
                                        })
                                    }
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    required
                                />
                            </div>
                        </div>
                        <div className='flex space-x-3'>
                            <button
                                type='submit'
                                className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700'
                            >
                                {editingDriver
                                    ? 'Update Driver'
                                    : 'Create Driver'}
                            </button>
                            <button
                                type='button'
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingDriver(null);
                                    setFormData({
                                        name: '',
                                        email: '',
                                        phone: '',
                                        licenseNumber: '',
                                    });
                                }}
                                className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700'
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Drivers List */}
            <div className='bg-white shadow rounded-lg'>
                <div className='p-4 border-b'>
                    <h3 className='text-lg font-semibold'>Drivers</h3>
                </div>
                <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200'>
                        <thead className='bg-gray-50'>
                            <tr>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Driver
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Contact
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    License
                                </th>
                                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className='bg-white divide-y divide-gray-200'>
                            {drivers.map((driver) => (
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
                                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                        <div className='flex space-x-2'>
                                            <button
                                                onClick={() =>
                                                    handleEdit(driver)
                                                }
                                                className='text-blue-600 hover:text-blue-900'
                                                title='Edit Driver'
                                            >
                                                <Edit className='w-4 h-4' />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(driver._id)
                                                }
                                                className='text-red-600 hover:text-red-900'
                                                title='Delete Driver'
                                            >
                                                <Trash className='w-4 h-4' />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DriverManagement;
