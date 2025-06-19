import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { socketService } from '../services/socket';
import { useAuth } from '../contexts/AuthContext';

// Custom bus icon
const busIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgMTJIMTJIMjFWMTRIM1YxMloiIGZpbGw9IiMzQjgyRjYiLz4KPHBhdGggZD0iTTUgMTBIMTlWMTZINVYxMFoiIGZpbGw9IiMzQjgyRjYiLz4KPGNpcmNsZSBjeD0iNyIgY3k9IjE3IiByPSIxIiBmaWxsPSIjMUIxRjIzIi8+CjxjaXJjbGUgY3g9IjE3IiBjeT0iMTciIHI9IjEiIGZpbGw9IiMxQjFGMjMiLz4KPC9zdmc+',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const Map = ({ buses = [], userRole, userId }) => {
  const [busLocations, setBusLocations] = useState(new Map());
  const { user } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socketService.connect(token);
      
      socketService.on('locationUpdate', (data) => {
        setBusLocations(prev => new Map(prev.set(data.busId, data)));
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, []);

  const filteredBuses = buses.filter(bus => {
    if (userRole === 'admin') return true;
    if (userRole === 'student' || userRole === 'parent') {
      return user?.assignedBus === bus._id;
    }
    if (userRole === 'staff') {
      return user?.assignedBus === bus._id;
    }
    return false;
  });

  const center = [40.7128, -74.0060]; // Default to NYC

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {filteredBuses.map(bus => {
          const location = busLocations.get(bus._id);
          if (!location) return null;
          
          return (
            <Marker
              key={bus._id}
              position={[location.latitude, location.longitude]}
              icon={busIcon}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{bus.busNumber}</h3>
                  <p className="text-sm text-gray-600">Route: {bus.route?.name}</p>
                  <p className="text-sm text-gray-600">Driver: {bus.driver?.name}</p>
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date(location.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;