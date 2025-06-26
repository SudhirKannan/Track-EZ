import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const defaultCenter = [13.0827, 80.2707]; // Chennai

// Custom marker icon - larger bus icon with fallback
const busIcon = new L.Icon({
    iconUrl:
        'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    iconSize: [50, 50], // Increased from 30x30 to 50x50
    iconAnchor: [25, 50], // Center the icon horizontally, anchor at bottom
    popupAnchor: [0, -50],
    className: 'bus-marker-icon',
});

// Fallback icon in case the main icon fails to load
const fallbackIcon = new L.Icon({
    iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconSize: [50, 50],
    iconAnchor: [25, 50],
    popupAnchor: [0, -50],
    className: 'bus-marker-icon',
});

// Component to handle map centering
const MapCenter = ({ center }) => {
    const map = useMap();

    useEffect(() => {
        if (center && center[0] && center[1]) {
            map.setView(center, 15); // Zoom level 15 for better detail
        }
    }, [center, map]);

    return null;
};

const LiveMap = ({ busId }) => {
    const { user } = useAuth();
    const [busLocations, setBusLocations] = useState({});
    const [selectedBusId, setSelectedBusId] = useState(busId);
    const [allBuses, setAllBuses] = useState([]);
    const [mapCenter, setMapCenter] = useState(defaultCenter);

    // Update selected bus when busId prop changes
    useEffect(() => {
        setSelectedBusId(busId);
    }, [busId]);

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

                // Auto-center map to selected bus location
                if (busId && locationMap[busId]) {
                    setMapCenter([
                        locationMap[busId].latitude,
                        locationMap[busId].longitude,
                    ]);
                }
            } catch (err) {
                console.error('Error fetching buses:', err);
            }
        };

        fetchBuses();
    }, [busId]);

    // Live updates via socket
    useEffect(() => {
        const socket = io('http://localhost:5000');

        socket.on(
            'locationUpdate',
            ({ busId: updatedBusId, latitude, longitude }) => {
                setBusLocations((prev) => ({
                    ...prev,
                    [updatedBusId]: {
                        ...prev[updatedBusId],
                        latitude,
                        longitude,
                    },
                }));

                // Auto-center map if this is the selected bus
                if (selectedBusId === updatedBusId) {
                    setMapCenter([latitude, longitude]);
                }
            }
        );

        return () => socket.disconnect();
    }, [selectedBusId]);

    if (!user) {
        return (
            <div className='p-4 text-red-500'>
                Please log in to view the map.
            </div>
        );
    }

    // If busId is provided, show only that bus
    const busesToShow = busId
        ? Object.entries(busLocations).filter(([id]) => id === busId)
        : Object.entries(busLocations);

    console.log('LiveMap rendering with:', {
        busId,
        busesToShow,
        busLocations,
        mapCenter,
    });

    return (
        <div className='h-full w-full'>
            <MapContainer
                center={mapCenter}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                className='rounded-lg'
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />
                <MapCenter center={mapCenter} />
                {busesToShow.map(([busId, loc]) => {
                    console.log(
                        'Rendering marker for bus:',
                        busId,
                        'at position:',
                        [loc.latitude, loc.longitude]
                    );
                    return (
                        <Marker
                            key={busId}
                            position={[loc.latitude, loc.longitude]}
                            icon={fallbackIcon}
                        >
                            <Popup>
                                <div className='text-center'>
                                    <div className='font-bold text-lg text-blue-600'>
                                        Bus {loc.busNumber || busId}
                                    </div>
                                    <div className='text-sm text-gray-600'>
                                        Latitude: {loc.latitude.toFixed(5)}
                                    </div>
                                    <div className='text-sm text-gray-600'>
                                        Longitude: {loc.longitude.toFixed(5)}
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default LiveMap;
