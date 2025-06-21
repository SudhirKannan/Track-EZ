# TrackEZ Bus Management System

A real-time bus tracking and management system built with React, Node.js, and MongoDB.

## 🚀 Features

-   Real-time bus location tracking
-   User management (Admin, Student, Parent, Staff)
-   Bus assignment and management
-   Live map with GPS coordinates
-   Socket.IO for real-time updates
-   JWT authentication
-   Responsive design with Tailwind CSS

## 🐛 Bug Fixes Applied

### Backend Fixes:

1. **Duplicate Route Registration**: Removed duplicate auth route registration in `server.js`
2. **Missing Route Imports**: Added all missing route imports (routes, drivers, students, staff, parents)
3. **Environment Variables**: Added proper environment variable handling
4. **Error Handling**: Improved error handling in authentication middleware
5. **API Endpoints**: Fixed inconsistent API endpoint responses

### Frontend Fixes:

1. **Undefined Variables**: Fixed undefined variables in LoginPage console.log
2. **API Error Handling**: Improved error handling in API service
3. **Socket Connection**: Enhanced socket connection with better error handling
4. **Component Loading**: Fixed loading states and error boundaries
5. **Route Navigation**: Added proper default routes and navigation
6. **Data Validation**: Added validation for API responses

## 📋 Prerequisites

-   Node.js (v16 or higher)
-   MongoDB (v4.4 or higher)
-   npm or yarn

## 🛠️ Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd sbms-bolt/project
    ```

2. **Install dependencies**

    ```bash
    npm run install-all
    ```

3. **Environment Setup**

    Create `.env` file in the backend directory:

    ```env
    # Database Configuration
    MONGODB_URI=mongodb://localhost:27017/trackez

    # JWT Configuration
    JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

    # Server Configuration
    PORT=5000
    NODE_ENV=development

    # Client URL for CORS
    CLIENT_URL=http://localhost:5173

    # API URL for GPS sender
    API_URL=http://localhost:5000/api
    ```

    Create `.env` file in the client directory:

    ```env
    VITE_API_URL=http://localhost:5000/api
    VITE_SOCKET_URL=http://localhost:5000
    ```

4. **Start MongoDB**

    ```bash
    mongod
    ```

5. **Run the application**

    ```bash
    # Development mode (both frontend and backend)
    npm run dev

    # Or run separately:
    npm run server  # Backend only
    npm run client  # Frontend only
    ```

## 🎯 Usage

1. **Access the application**: http://localhost:5173
2. **Register/Login**: Create an admin account first
3. **Add Buses**: Use the admin dashboard to add buses
4. **Assign Users**: Assign students to buses
5. **Track Buses**: View real-time bus locations on the map

## 🔧 API Endpoints

### Authentication

-   `POST /api/auth/register` - Register new user
-   `POST /api/auth/login` - User login
-   `GET /api/auth/me` - Get current user
-   `GET /api/auth/verify` - Verify token

### Buses

-   `GET /api/buses` - Get all buses (Admin only)
-   `POST /api/buses` - Create new bus (Admin only)
-   `POST /api/buses/location` - Update bus location

### Users

-   `GET /api/users` - Get all users (Admin only)
-   `PUT /api/users/:id/assign-bus` - Assign bus to user

### Location

-   `POST /api/location` - Update bus location
-   `GET /api/location/:busId` - Get bus location

## 🗄️ Database Models

-   **User**: Authentication and user management
-   **Bus**: Bus information and current location
-   **Route**: Bus routes and stops
-   **Driver**: Driver information
-   **Student**: Student information
-   **Parent**: Parent information

## 🚨 Known Issues & Solutions

1. **MongoDB Connection**: Ensure MongoDB is running before starting the server
2. **CORS Issues**: Check that CLIENT_URL is correctly set in backend .env
3. **Socket Connection**: Ensure both frontend and backend are running for real-time features
4. **JWT Token**: Clear localStorage if authentication issues occur

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the repository or contact the development team.
