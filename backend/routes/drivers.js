import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import Bus from '../models/Bus.js';
import Driver from '../models/Driver.js';

const router = express.Router();

// Get all drivers with assigned bus information
router.get('/', async (req, res) => {
    try {
        const drivers = await Driver.find({ isActive: true }).sort({ name: 1 });

        // Get bus information for each driver
        const driversWithBuses = await Promise.all(
            drivers.map(async (driver) => {
                const assignedBus = await Bus.findOne({
                    driver: driver._id,
                }).select('busNumber capacity currentLocation isActive');

                return {
                    ...driver.toObject(),
                    assignedBus: assignedBus || null,
                };
            })
        );

        res.json(driversWithBuses);
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get driver by ID with assigned bus information
router.get('/:id', async (req, res) => {
    try {
        const driver = await Driver.findById(req.params.id);

        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Get assigned bus information
        const assignedBus = await Bus.findOne({ driver: driver._id }).select(
            'busNumber capacity currentLocation isActive'
        );

        const driverWithBus = {
            ...driver.toObject(),
            assignedBus: assignedBus || null,
        };

        res.json(driverWithBus);
    } catch (error) {
        console.error('Error fetching driver:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new driver (Admin only)
router.post('/', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const { name, email, phone, licenseNumber } = req.body;

        // Check if email or license number already exists
        const existingDriver = await Driver.findOne({
            $or: [{ email }, { licenseNumber }],
        });

        if (existingDriver) {
            return res.status(400).json({
                message:
                    'Driver with this email or license number already exists',
            });
        }

        const driver = new Driver({
            name,
            email,
            phone,
            licenseNumber,
        });

        await driver.save();
        res.status(201).json(driver);
    } catch (error) {
        console.error('Error creating driver:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update driver (Admin only)
router.put('/:id', authenticate, requireRole(['admin']), async (req, res) => {
    try {
        const { name, email, phone, licenseNumber } = req.body;

        // Check if email or license number already exists (excluding current driver)
        const existingDriver = await Driver.findOne({
            $or: [{ email }, { licenseNumber }],
            _id: { $ne: req.params.id },
        });

        if (existingDriver) {
            return res.status(400).json({
                message:
                    'Driver with this email or license number already exists',
            });
        }

        const driver = await Driver.findByIdAndUpdate(
            req.params.id,
            { name, email, phone, licenseNumber },
            { new: true }
        );

        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        res.json(driver);
    } catch (error) {
        console.error('Error updating driver:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete driver (Admin only)
router.delete(
    '/:id',
    authenticate,
    requireRole(['admin']),
    async (req, res) => {
        try {
            const driver = await Driver.findByIdAndUpdate(
                req.params.id,
                { isActive: false },
                { new: true }
            );

            if (!driver) {
                return res.status(404).json({ message: 'Driver not found' });
            }

            res.json({ message: 'Driver deleted successfully' });
        } catch (error) {
            console.error('Error deleting driver:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

export default router;
