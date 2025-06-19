import express from 'express';
import Bus from '../models/Bus.js';
import Student from '../models/Student.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get staff's assigned bus info (Staff only)
router.get('/bus-info', requireRole(['staff']), async (req, res) => {
  try {
    // In a real app, you'd have a proper staff-bus relationship
    // For now, we'll use the assignedBus field from the user
    const bus = await Bus.findById(req.user.assignedBus)
      .populate('driver')
      .populate('route');

    if (!bus) {
      return res.status(404).json({ message: 'No bus assigned' });
    }

    res.json(bus);
  } catch (error) {
    console.error('Error fetching bus info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get students on staff's bus (Staff only)
router.get('/students', requireRole(['staff']), async (req, res) => {
  try {
    if (!req.user.assignedBus) {
      return res.json([]);
    }

    const students = await Student.find({ 
      assignedBus: req.user.assignedBus,
      isActive: true 
    }).sort({ name: 1 });

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;