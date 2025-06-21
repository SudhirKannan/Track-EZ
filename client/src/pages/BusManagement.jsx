import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import LiveMap from '../components/LiveMap';

const BusManagement = () => {
  const [buses, setBuses] = useState([]); // ✅ must be an array
  const [selectedBusId, setSelectedBusId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        
        const res = await api.get('/buses');
        // console.log(res.data.buses);
        if (Array.isArray(res.data.buses)) {
          setBuses(res.data.buses);
          setSelectedBusId(res.data.buses[0]?._id || null); // default select first bus
        } else {
          console.error('Invalid bus response:', res.data);
          setBuses([]);
        }
      } catch (err) {
        setError('Failed to load buses');
        console.error(err);
      }
    };

    fetchBuses();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Bus Management</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* Bus List */}
      <div className="bg-white shadow rounded mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Bus Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Driver</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {buses.map((bus) => (
              <tr key={bus._id}>
                <td className="px-6 py-4">{bus.busNumber || 'Unnamed Bus'}</td>
                <td className="px-6 py-4">{bus.driver || 'N/A'}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedBusId(bus._id)}
                    className="text-blue-600 hover:underline"
                  >
                    Show on Map
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Live Map */}
      {selectedBusId && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Live Location for Selected Bus</h3>
          <LiveMap busId={selectedBusId} />
        </div>
      )}
    </div>
  );
};

export default BusManagement;