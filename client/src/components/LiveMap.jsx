import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const defaultCenter = [13.0827, 80.2707]; // Chennai

// Custom bus marker icon
const busIcon = new L.Icon({
    iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [40, 100],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Alternative: Simple colored circle marker
const createBusIcon = (color = '#3B82F6') => {
    return L.divIcon({
        html: `<div style="
            background-color: ${color};
            width: 35px;
            height: 35px;
            border-radius: 50%;
            border: 4px solid white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.4), 0 0 0 3px ${color}40;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 18px;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        ">🚌</div>`,
        className: 'custom-bus-marker',
        iconSize: [35, 35],
        iconAnchor: [17, 17],
    });
};

// Component to handle map centering
const MapController = ({ selectedBusId, busLocations }) => {
    const map = useMap();

    useEffect(() => {
        if (selectedBusId && busLocations[selectedBusId]) {
            const location = busLocations[selectedBusId];
            if (location.latitude && location.longitude) {
                map.setView([location.latitude, location.longitude], 15);
            }
        } else {
            // Show all buses with appropriate zoom
            const locations = Object.values(busLocations).filter(
                (loc) => loc.latitude && loc.longitude
            );
            if (locations.length > 0) {
                const bounds = L.latLngBounds(
                    locations.map((loc) => [loc.latitude, loc.longitude])
                );
                map.fitBounds(bounds, { padding: [20, 20] });
            } else {
                map.setView(defaultCenter, 13);
            }
        }
    }, [selectedBusId, busLocations, map]);

    return null;
};

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

                    {/* Map Controller for auto-centering */}
                    <MapController
                        selectedBusId={selectedBusId}
                        busLocations={busLocations}
                    />

                    {Object.entries(busLocations)
                        .filter(
                            ([id]) => !selectedBusId || id === selectedBusId
                        )
                        .filter(([busId, loc]) => loc.latitude && loc.longitude)
                        .map(([busId, loc]) => (
                            <Marker
                                key={busId}
                                position={[loc.latitude, loc.longitude]}
                                icon={createBusIcon(
                                    selectedBusId === busId
                                        ? '#FF4444'
                                        : '#00AAFF'
                                )}
                            >
                                <Popup>
                                    <div className='text-center'>
                                        <div className='text-lg mb-1'>🚌</div>
                                        <strong>
                                            Bus: {loc.busNumber || busId}
                                        </strong>
                                        <br />
                                        <small className='text-gray-600'>
                                            Lat: {loc.latitude ? loc.latitude.toFixed(5) : 'N/A'}
                                            <br />
                                            Lng: {loc.longitude ? loc.longitude.toFixed(5) : 'N/A'}
                                        </small>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default LiveMap;
