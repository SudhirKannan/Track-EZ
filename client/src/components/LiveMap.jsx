import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const defaultCenter = [13.0827, 80.2707]; // Chennai

// Custom marker icon
const busIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/61/61230.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
});

const LiveMap = () => {
    const { user } = useAuth();
    const [busLocations, setBusLocations] = useState({});
    const [selectedBusId, setSelectedBusId] = useState(null);
    const [allBuses, setAllBuses] = useState([]);

    // Fetch all buses
    useEffect(() => {
        const fetchBuses = async () => {
            try {
                const res = await api.get('/buses');
                const buses = res.data.buses || res.data;
                console.log('Fetched bus data:', res.data);

                setAllBuses(buses);

                const locationMap = {};
                buses.forEach((bus) => {
                    if (bus.currentLocation) {
                        locationMap[bus._id] = {
                            latitude: bus.currentLocation.latitude,
                            longitude: bus.currentLocation.longitude,
                            busNumber: bus.busNumber || bus._id,
                        };
                    }
                });

                setBusLocations(locationMap);
            } catch (err) {
                console.error('Error fetching buses:', err);
            }
        };

        fetchBuses();
    }, []);

    // Live updates via socket
    useEffect(() => {
        const socket = io('http://localhost:5000');

        socket.on('locationUpdate', ({ busId, latitude, longitude }) => {
            setBusLocations((prev) => ({
                ...prev,
                [busId]: {
                    ...prev[busId],
                    latitude,
                    longitude,
                },
            }));
        });

        return () => socket.disconnect();
    }, []);

    if (!user) {
        return (
            <div className='p-4 text-red-500'>
                Please log in to view the map.
            </div>
        );
    }

    return (
        <div className='flex'>
            {/* Sidebar */}
            <div className='w-64 bg-white border-r p-4 space-y-3'>
                <h2 className='text-lg font-semibold mb-2'>Bus Selector</h2>
                {allBuses.map((bus) => (
                    <button
                        key={bus._id}
                        onClick={() => setSelectedBusId(bus._id)}
                        className={`block w-full text-left px-3 py-2 rounded ${
                            selectedBusId === bus._id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100'
                        }`}
                    >
                        {bus.busNumber || `Bus ${bus._id.slice(-4)}`}
                    </button>
                ))}
                <button
                    onClick={() => setSelectedBusId(null)}
                    className='block w-full mt-4 bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300'
                >
                    Show All Buses
                </button>
            </div>

            {/* Map */}
            <div className='flex-1 h-screen'>
                <MapContainer
                    center={defaultCenter}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    />
                    {Object.entries(busLocations)
                        .filter(
                            ([id]) => !selectedBusId || id === selectedBusId
                        )
                        .map(([busId, loc]) => (
                            <Marker
                                key={busId}
                                position={[loc.latitude, loc.longitude]}
                                icon={busIcon}
                            >
                                <Popup>
                                    Bus: {loc.busNumber || busId}
                                    <br />
                                    Lat: {loc.latitude.toFixed(5)}
                                    <br />
                                    Lng: {loc.longitude.toFixed(5)}
                                </Popup>
                            </Marker>
                        ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default LiveMap;
