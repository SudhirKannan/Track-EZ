import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import Bus from '../models/Bus.js';
import User from '../models/User.js';

const router = express.Router();

// Get all buses (Admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const buses = await Bus.find()
            .populate('driver', 'name email phone')
            .populate('route', 'routeName')
            .populate('students', 'name email studentId');

        res.json({ buses });
    } catch (error) {
        console.error('Get buses error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's assigned bus
router.get('/my-bus', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'assignedBus',
            populate: [
                { path: 'driver', select: 'name phone' },
                { path: 'route', select: 'routeName stops' },
            ],
        });

        if (!user.assignedBus) {
            return res.status(404).json({ message: 'No bus assigned' });
        }

        res.json({ bus: user.assignedBus });
    } catch (error) {
        console.error('Get my bus error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new bus (Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { busNumber, capacity, driverId, routeId } = req.body;

        // Check if bus number already exists
        const existingBus = await Bus.findOne({ busNumber });
        if (existingBus) {
            return res
                .status(400)
                .json({ message: 'Bus number already exists' });
        }

        const bus = new Bus({
            busNumber,
            capacity,
            driver: driverId || null,
            route: routeId || null,
        });

        await bus.save();
        await bus.populate('driver', 'name email phone');
        await bus.populate('route', 'routeName');

        res.status(201).json({
            message: 'Bus created successfully',
            bus,
        });
    } catch (error) {
        console.error('Create bus error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update bus (Admin only)
router.put('/:busId', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { busNumber, capacity, driverId, routeId } = req.body;
        const { busId } = req.params;

        // Check if bus exists
        const existingBus = await Bus.findById(busId);
        if (!existingBus) {
            return res.status(404).json({ message: 'Bus not found' });
        }

        // Check if bus number already exists (excluding current bus)
        if (busNumber && busNumber !== existingBus.busNumber) {
            const duplicateBus = await Bus.findOne({ busNumber });
            if (duplicateBus) {
                return res
                    .status(400)
                    .json({ message: 'Bus number already exists' });
            }
        }

        const updatedBus = await Bus.findByIdAndUpdate(
            busId,
            {
                busNumber,
                capacity,
                driver: driverId || null,
                route: routeId || null,
            },
            { new: true }
        )
            .populate('driver', 'name email phone')
            .populate('route', 'routeName');

        res.json({
            message: 'Bus updated successfully',
            bus: updatedBus,
        });
    } catch (error) {
        console.error('Update bus error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete bus (Admin only)
router.delete('/:busId', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { busId } = req.params;

        // Check if bus exists
        const existingBus = await Bus.findById(busId);
        if (!existingBus) {
            return res.status(404).json({ message: 'Bus not found' });
        }

        // Check if bus has assigned students
        if (existingBus.students && existingBus.students.length > 0) {
            return res.status(400).json({
                message:
                    'Cannot delete bus with assigned students. Please reassign students first.',
            });
        }

        await Bus.findByIdAndDelete(busId);

        res.json({
            message: 'Bus deleted successfully',
        });
    } catch (error) {
        console.error('Delete bus error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update bus location
router.post('/location', async (req, res) => {
    try {
        const { busId, latitude, longitude } = req.body;

        const bus = await Bus.findByIdAndUpdate(
            busId,
            {
                'currentLocation.latitude': latitude,
                'currentLocation.longitude': longitude,
                'currentLocation.lastUpdated': new Date(),
            },
            { new: true }
        );

        if (!bus) {
            return res.status(404).json({ message: 'Bus not found' });
        }

        // Emit location update via Socket.IO
        req.app.get('io').emit('locationUpdate', {
            busId: bus._id,
            busNumber: bus.busNumber,
            location: bus.currentLocation,
        });

        res.json({ message: 'Location updated successfully' });
    } catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/:busId/location', async (req, res) => {
    try {
        const bus = await Bus.findById(req.params.busId);

        if (!bus) {
            return res.status(404).json({ message: 'Bus not found' });
        }

        const loc = bus.currentLocation;

        if (!loc || loc.latitude == null || loc.longitude == null) {
            return res.status(404).json({ message: 'Location not available' });
        }

        res.json({
            location: {
                lat: loc.latitude,
                lng: loc.longitude,
            },
        });
    } catch (error) {
        console.error('Error fetching bus location:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
