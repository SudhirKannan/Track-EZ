import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';

// Import routes
import authRoutes from './routes/auth.js';
import busRoutes from './routes/buses.js';
import driverRoutes from './routes/drivers.js';
import locationRoutes from './routes/location.js';
import parentRoutes from './routes/parents.js';
import routeRoutes from './routes/routes.js';
import staffRoutes from './routes/staff.js';
import studentRoutes from './routes/students.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true,
    })
);
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/users', userRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/parents', parentRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({
        message: 'TrackEZ Backend Server is running!',
        status: 'success',
        timestamp: new Date().toISOString(),
    });
});

// Test route for debugging
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        routes: [
            'auth',
            'buses',
            'users',
            'drivers',
            'location',
            'routes',
            'students',
            'staff',
            'parents',
        ],
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinBusRoom', (busId) => {
        socket.join(`bus_${busId}`);
        console.log(`User ${socket.id} joined bus room: ${busId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
// hello9