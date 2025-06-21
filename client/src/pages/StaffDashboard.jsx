// import React, { useEffect, useState, useRef } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import { Bus, MapPin, Users, User, LogOut, Settings } from 'lucide-react';
// import { api } from '../services/api';
// import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import io from 'socket.io-client';

// const socket = io('http://localhost:5000');

// const CenterMap = ({ location }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (location?.lat && location?.lng) {
//       map.setView([location.lat, location.lng], 16);
//     }
//   }, [location]);
//   return null;
// };

// const StaffDashboard = () => {
//   const { user, logout } = useAuth();
//   const [location, setLocation] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const busId = user?.assignedBus;

//   useEffect(() => {
//     if (!busId) {
//       setLoading(false);
//       return;
//     }

//     const fetchLocation = async () => {
//       try {
//         const res = await api.get(`/buses/${busId}/location`);
//         if (res.data.location?.lat && res.data.location?.lng) {
//           setLocation(res.data.location);
//         }
//       } catch (err) {
//         console.error('Error fetching location:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLocation();

//     // Listen for live updates
//     socket.on('locationUpdate', (data) => {
//       if (data.busId === busId && data.location) {
//         setLocation({
//           lat: data.location.latitude,
//           lng: data.location.longitude
//         });
//       }
//     });

//     return () => {
//       socket.off('locationUpdate');
//     };
//   }, [busId]);

//   const busIcon = new L.Icon({
//     iconUrl: '/bus-icon.png', // Replace with your bus icon path
//     iconSize: [30, 30],
//     iconAnchor: [15, 30],
//   });

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header */}
//       <header className="bg-white shadow">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-6">
//             <div className="flex items-center">
//               <Bus className="h-8 w-8 text-blue-600" />
//               <h1 className="ml-2 text-2xl font-bold text-gray-900">TrackEZ Staff</h1>
//             </div>
//             <div className="flex items-center space-x-4">
//               <div className="flex items-center">
//                 <User className="h-5 w-5 text-gray-400 mr-2" />
//                 <span className="text-sm text-gray-700">{user?.name}</span>
//               </div>
//               <button
//                 onClick={logout}
//                 className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900"
//               >
//                 <LogOut className="h-4 w-4 mr-1" />
//                 Logout
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 py-6 sm:px-0">
//           {/* Map Section */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Bus Info */}
//             <div className="bg-white overflow-hidden shadow rounded-lg">
//               <div className="px-4 py-5 sm:p-6">
//                 <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Bus</h3>
//                 {busId ? (
//                   <p className="text-sm text-gray-800">Bus ID: {busId}</p>
//                 ) : (
//                   <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
//                     <div className="flex">
//                       <Bus className="h-5 w-5 text-blue-400" />
//                       <div className="ml-3">
//                         <h4 className="text-sm font-medium text-blue-800">No Bus Assigned</h4>
//                         <p className="text-sm text-blue-700 mt-1">Please contact the admin to get assigned to a bus.</p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Live Map */}
//             <div className="bg-white overflow-hidden shadow rounded-lg">
//               <div className="px-4 py-5 sm:p-6">
//                 <h3 className="text-lg font-medium text-gray-900 mb-4">Live Bus Tracking</h3>
//                 <div className="h-64 rounded-md overflow-hidden bg-gray-100">
//                   {loading ? (
//                     <p className="text-center mt-24 text-gray-500">Loading location...</p>
//                   ) : location ? (
//                     <MapContainer
//                       center={[location.lat, location.lng]}
//                       zoom={16}
//                       scrollWheelZoom={false}
//                       className="h-full w-full z-0"
//                     >
//                       <TileLayer
//                         attribution='&copy; OpenStreetMap contributors'
//                         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                       />
//                       <Marker position={[location.lat, location.lng]} icon={busIcon}>
//                         <Popup>Your Assigned Bus</Popup>
//                       </Marker>
//                       <CenterMap location={location} />
//                     </MapContainer>
//                   ) : (
//                     <p className="text-center mt-24 text-gray-500">No bus location available</p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Staff Info */}
//             <div className="bg-white overflow-hidden shadow rounded-lg">
//               <div className="px-4 py-5 sm:p-6">
//                 <h3 className="text-lg font-medium text-gray-900 mb-4">Staff Information</h3>
//                 <dl className="space-y-3">
//                   <div>
//                     <dt className="text-sm font-medium text-gray-500">Name</dt>
//                     <dd className="text-sm text-gray-900">{user?.name}</dd>
//                   </div>
//                   <div>
//                     <dt className="text-sm font-medium text-gray-500">Email</dt>
//                     <dd className="text-sm text-gray-900">{user?.email}</dd>
//                   </div>
//                   <div>
//                     <dt className="text-sm font-medium text-gray-500">Phone</dt>
//                     <dd className="text-sm text-gray-900">{user?.phone || 'Not provided'}</dd>
//                   </div>
//                   <div>
//                     <dt className="text-sm font-medium text-gray-500">Role</dt>
//                     <dd className="text-sm text-gray-900 capitalize">{user?.role}</dd>
//                   </div>
//                 </dl>
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="bg-white overflow-hidden shadow rounded-lg">
//               <div className="px-4 py-5 sm:p-6">
//                 <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
//                 <div className="space-y-3">
//                   <button className="w-full flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
//                     <Settings className="h-4 w-4 mr-2" />
//                     Update Profile
//                   </button>
//                   <button className="w-full flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
//                     <Users className="h-4 w-4 mr-2" />
//                     View Students
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default StaffDashboard;
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bus, MapPin, Users, User, LogOut, Settings } from 'lucide-react';
import { api } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const CenterMap = ({ location }) => {
  const map = useMap();
  useEffect(() => {
    if (location?.lat && location?.lng) {
      map.setView([location.lat, location.lng], map.getZoom(), {
        animate: true,
        duration: 0.5,
      });
    }
  }, [location]);
  return null;
};

const StaffDashboard = () => {
  const { user, logout } = useAuth();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const busId = user?.assignedBus;

  useEffect(() => {
    if (!busId) {
      setLoading(false);
      return;
    }

    const fetchInitialLocation = async () => {
      try {
        const res = await api.get(`/buses/${busId}/location`);
        if (res.data.location?.lat && res.data.location?.lng) {
          setLocation(res.data.location);
        }
      } catch (err) {
        console.error('Error fetching location:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialLocation();

    socket.on('locationUpdate', (data) => {
      if (data.busId === busId && data.location) {
        setLocation({
          lat: data.location.latitude,
          lng: data.location.longitude,
        });
      }
    });

    return () => {
      socket.off('locationUpdate');
    };
  }, [busId]);

  const busIcon = new L.Icon({
    iconUrl: '/bus-icon.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Bus className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">TrackEZ Staff</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 py-6 sm:px-0">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Bus</h3>
                {busId ? (
                  <p className="text-sm text-gray-800">Bus ID: {busId}</p>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                      <Bus className="h-5 w-5 text-blue-400" />
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800">No Bus Assigned</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Please contact the admin to get assigned to a bus.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Live Bus Tracking</h3>
                <div className="h-64 rounded-md overflow-hidden bg-gray-100">
                  {loading ? (
                    <p className="text-center mt-24 text-gray-500">Loading location...</p>
                  ) : location ? (
                    <MapContainer
                      center={[location.lat, location.lng]}
                      zoom={16}
                      scrollWheelZoom={false}
                      className="h-full w-full z-0"
                    >
                      <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[location.lat, location.lng]} icon={busIcon}>
                        <Popup>Your Assigned Bus</Popup>
                      </Marker>
                      <CenterMap location={location} />
                    </MapContainer>
                  ) : (
                    <p className="text-center mt-24 text-gray-500">No bus location available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Staff Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="text-sm text-gray-900">{user?.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="text-sm text-gray-900">{user?.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="text-sm text-gray-900">{user?.phone || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                    <dd className="text-sm text-gray-900 capitalize">{user?.role}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                    <Settings className="h-4 w-4 mr-2" />
                    Update Profile
                  </button>
                  <button className="w-full flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                    <Users className="h-4 w-4 mr-2" />
                    View Students
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
