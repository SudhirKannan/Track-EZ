import { Bus, Edit, MapPin, Plus, Route, Trash2, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import LiveMap from '../components/LiveMap';
import { api } from '../services/api';

const BusManagement = () => {
    const [buses, setBuses] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedBusId, setSelectedBusId] = useState(null);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBus, setSelectedBus] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        busNumber: '',
        capacity: '',
        driver: '',
        route: '',
        licensePlate: '',
    });

    // Fetch buses, drivers, and routes
    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log('Fetching data...');
                setLoading(true);
                const [busesRes, driversRes, routesRes] = await Promise.all([
                    api.get('/buses'),
                    api.get('/drivers'),
                    api.get('/routes'),
                ]);

                console.log('Buses response:', busesRes.data);
                console.log('Drivers response:', driversRes.data);
                console.log('Routes response:', routesRes.data);

                const busesData = busesRes.data.buses || [];
                setBuses(busesData);
                setDrivers(driversRes.data.drivers || []);
                setRoutes(routesRes.data.routes || []);

                // Set first bus as selected by default
                if (busesData.length > 0 && !selectedBusId) {
                    setSelectedBusId(busesData[0]._id);
                }

                console.log('Data loaded successfully');
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAddBus = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/buses', formData);
            const newBus = res.data.bus;
            setBuses([...buses, newBus]);

            // Select the new bus on the map
            setSelectedBusId(newBus._id);

            setShowAddModal(false);
            resetForm();
        } catch (err) {
            console.error('Error adding bus:', err);
            setError(err.response?.data?.message || 'Failed to add bus');
        }
    };

    const handleEditBus = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/buses/${selectedBus._id}`, formData);
            setBuses(
                buses.map((bus) =>
                    bus._id === selectedBus._id ? res.data.bus : bus
                )
            );
            setShowEditModal(false);
            setSelectedBus(null);
            resetForm();
        } catch (err) {
            console.error('Error updating bus:', err);
            setError(err.response?.data?.message || 'Failed to update bus');
        }
    };

    const handleDeleteBus = async () => {
        if (!selectedBus) {
            setError('No bus selected for deletion');
            return;
        }

        try {
            console.log('Starting delete process for bus:', selectedBus._id);
            console.log('Selected bus details:', selectedBus);

            const response = await api.delete(`/buses/${selectedBus._id}`);
            console.log('Delete response:', response);

            const updatedBuses = buses.filter(
                (bus) => bus._id !== selectedBus._id
            );
            console.log('Updated buses list:', updatedBuses);

            setBuses(updatedBuses);

            // If we deleted the selected bus, select the first available bus
            if (selectedBus._id === selectedBusId) {
                const newSelectedBusId =
                    updatedBuses.length > 0 ? updatedBuses[0]._id : null;
                setSelectedBusId(newSelectedBusId);
                console.log('New selected bus ID:', newSelectedBusId);
            }

            setShowDeleteModal(false);
            setSelectedBus(null);
            setError(null); // Clear any previous errors
            console.log('Bus deleted successfully');
        } catch (err) {
            console.error('Error deleting bus:', err);
            console.error('Error response:', err.response);
            console.error('Error message:', err.message);
            setError(
                err.response?.data?.message ||
                    'Failed to delete bus. Please try again.'
            );
        }
    };

    const openEditModal = (bus) => {
        setSelectedBus(bus);
        setFormData({
            busNumber: bus.busNumber || '',
            capacity: bus.capacity || '',
            driver: bus.driver?._id || '',
            route: bus.route?._id || '',
            licensePlate: bus.licensePlate || '',
        });
        setShowEditModal(true);
    };

    const openDeleteModal = (bus) => {
        setSelectedBus(bus);
        setShowDeleteModal(true);
    };

    const resetForm = () => {
        setFormData({
            busNumber: '',
            capacity: '',
            driver: '',
            route: '',
            licensePlate: '',
        });
    };

    const Modal = ({ isOpen, onClose, title, children }) => {
        if (!isOpen) return null;

        return (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay'>
                <div className='bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto modal-content'>
                    <div className='flex justify-between items-center mb-4'>
                        <h3 className='text-lg font-semibold'>{title}</h3>
                        <button
                            onClick={onClose}
                            className='text-gray-500 hover:text-gray-700'
                        >
                            ✕
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className='p-6'>
                <div className='flex items-center justify-center h-64'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                </div>
                <p className='text-center text-gray-600'>Loading bus data...</p>
            </div>
        );
    }

    console.log('Rendering BusManagement with:', {
        buses,
        selectedBusId,
        error,
    });

    return (
        <div className='p-6'>
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>
                    Bus Management
                </h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center'
                >
                    <Plus className='h-4 w-4 mr-2' />
                    Add Bus
                </button>
            </div>

            {error && (
                <div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4'>
                    {error}
                </div>
            )}

            <div className='space-y-6'>
                {/* Bus List */}
                <div className='bg-white shadow rounded-lg overflow-hidden'>
                    <div className='px-6 py-4 border-b border-gray-200'>
                        <h3 className='text-lg font-medium text-gray-900'>
                            Bus List ({buses.length} buses)
                        </h3>
                    </div>
                    <div className='overflow-x-auto'>
                        <table className='min-w-full divide-y divide-gray-200'>
                            <thead className='bg-gray-50'>
                                <tr>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Bus Details
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Driver
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Route
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='bg-white divide-y divide-gray-200'>
                                {buses.map((bus) => (
                                    <tr
                                        key={bus._id}
                                        className={`hover:bg-gray-50 cursor-pointer ${
                                            selectedBusId === bus._id
                                                ? 'bg-blue-50 border-l-4 border-blue-500'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            setSelectedBusId(bus._id)
                                        }
                                    >
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            <div className='flex items-center'>
                                                <Bus className='h-5 w-5 text-blue-600 mr-3' />
                                                <div>
                                                    <div className='text-sm font-medium text-gray-900'>
                                                        {bus.busNumber}
                                                    </div>
                                                    {bus.licensePlate && (
                                                        <div className='text-sm text-gray-500'>
                                                            {bus.licensePlate}
                                                        </div>
                                                    )}
                                                    <div className='text-sm text-gray-500'>
                                                        Capacity: {bus.capacity}{' '}
                                                        passengers
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            {bus.driver ? (
                                                <div className='flex items-center'>
                                                    <User className='h-4 w-4 text-gray-400 mr-2' />
                                                    <span className='text-sm text-gray-900'>
                                                        {bus.driver.name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className='text-sm text-gray-500'>
                                                    No driver assigned
                                                </span>
                                            )}
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap'>
                                            {bus.route ? (
                                                <div className='flex items-center'>
                                                    <Route className='h-4 w-4 text-gray-400 mr-2' />
                                                    <span className='text-sm text-gray-900'>
                                                        {bus.route.routeName}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className='text-sm text-gray-500'>
                                                    No route assigned
                                                </span>
                                            )}
                                        </td>
                                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                            <div className='flex space-x-2'>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openEditModal(bus);
                                                    }}
                                                    className='text-blue-600 hover:text-blue-900 flex items-center'
                                                >
                                                    <Edit className='h-4 w-4 mr-1' />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        openDeleteModal(bus);
                                                    }}
                                                    className='text-red-600 hover:text-red-900 flex items-center'
                                                >
                                                    <Trash2 className='h-4 w-4 mr-1' />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {buses.length === 0 && (
                        <div className='text-center py-8'>
                            <Bus className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                            <p className='text-gray-500'>
                                No buses found. Add your first bus to get
                                started.
                            </p>
                        </div>
                    )}
                </div>

                {/* Live Map */}
                <div className='bg-white shadow rounded-lg'>
                    <div className='px-6 py-4 border-b border-gray-200'>
                        <h3 className='text-lg font-medium text-gray-900'>
                            Live Location Tracking
                        </h3>
                        {selectedBusId && (
                            <p className='text-sm text-gray-600 mt-1'>
                                Selected:{' '}
                                {
                                    buses.find((b) => b._id === selectedBusId)
                                        ?.busNumber
                                }
                            </p>
                        )}
                    </div>
                    <div className='p-4'>
                        {selectedBusId ? (
                            <div className='h-[600px]'>
                                <LiveMap busId={selectedBusId} />
                            </div>
                        ) : (
                            <div className='h-[600px] flex items-center justify-center bg-gray-50 rounded-lg'>
                                <div className='text-center'>
                                    <MapPin className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                                    <p className='text-gray-500'>
                                        Select a bus to view its live location
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Bus Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title='Add New Bus'
            >
                <form onSubmit={handleAddBus} className='space-y-4'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>
                            Bus Number
                        </label>
                        <input
                            type='text'
                            value={formData.busNumber}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    busNumber: e.target.value,
                                })
                            }
                            className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                            required
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>
                            License Plate
                        </label>
                        <input
                            type='text'
                            value={formData.licensePlate}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    licensePlate: e.target.value,
                                })
                            }
                            className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>
                            Capacity
                        </label>
                        <input
                            type='number'
                            value={formData.capacity}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    capacity: e.target.value,
                                })
                            }
                            className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                            required
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>
                            Driver
                        </label>
                        <select
                            value={formData.driver}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    driver: e.target.value,
                                })
                            }
                            className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                        >
                            <option value=''>Select a driver</option>
                            {drivers.map((driver) => (
                                <option key={driver._id} value={driver._id}>
                                    {driver.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>
                            Route
                        </label>
                        <select
                            value={formData.route}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    route: e.target.value,
                                })
                            }
                            className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                        >
                            <option value=''>Select a route</option>
                            {routes.map((route) => (
                                <option key={route._id} value={route._id}>
                                    {route.routeName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='flex justify-end space-x-3 pt-4'>
                        <button
                            type='button'
                            onClick={() => setShowAddModal(false)}
                            className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
                        >
                            Add Bus
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Bus Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title='Edit Bus'
            >
                <form onSubmit={handleEditBus} className='space-y-4'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>
                            Bus Number
                        </label>
                        <input
                            type='text'
                            value={formData.busNumber}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    busNumber: e.target.value,
                                })
                            }
                            className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                            required
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>
                            License Plate
                        </label>
                        <input
                            type='text'
                            value={formData.licensePlate}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    licensePlate: e.target.value,
                                })
                            }
                            className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>
                            Capacity
                        </label>
                        <input
                            type='number'
                            value={formData.capacity}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    capacity: e.target.value,
                                })
                            }
                            className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                            required
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>
                            Driver
                        </label>
                        <select
                            value={formData.driver}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    driver: e.target.value,
                                })
                            }
                            className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                        >
                            <option value=''>Select a driver</option>
                            {drivers.map((driver) => (
                                <option key={driver._id} value={driver._id}>
                                    {driver.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>
                            Route
                        </label>
                        <select
                            value={formData.route}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    route: e.target.value,
                                })
                            }
                            className='mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                        >
                            <option value=''>Select a route</option>
                            {routes.map((route) => (
                                <option key={route._id} value={route._id}>
                                    {route.routeName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='flex justify-end space-x-3 pt-4'>
                        <button
                            type='button'
                            onClick={() => setShowEditModal(false)}
                            className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
                        >
                            Cancel
                        </button>
                        <button
                            type='submit'
                            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
                        >
                            Update Bus
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title='Delete Bus'
            >
                <div className='space-y-4'>
                    <p className='text-gray-600'>
                        Are you sure you want to delete bus "
                        {selectedBus?.busNumber}"? This action cannot be undone.
                    </p>
                    <div className='flex justify-end space-x-3'>
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDeleteBus}
                            className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700'
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BusManagement;
