import express from 'express';
import User from '../models/User.js';
import Bus from '../models/Bus.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('assignedBus', 'busNumber')
      .populate('parentOf', 'name email');
    
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign bus to student
router.post('/assign-bus', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { userId, busId } = req.body;

    const user = await User.findById(userId);
    const bus = await Bus.findById(busId);

    if (!user || !bus) {
      return res.status(404).json({ message: 'User or Bus not found' });
    }

    // Check bus capacity
    const currentStudents = await User.countDocuments({ assignedBus: busId });
    if (currentStudents >= bus.capacity) {
      return res.status(400).json({ message: 'Bus is at full capacity' });
    }

    // Update user's assigned bus
    user.assignedBus = busId;
    await user.save();

    // Add student to bus
    if (!bus.students.includes(userId)) {
      bus.students.push(userId);
      await bus.save();
    }

    res.json({ message: 'Bus assigned successfully' });
  } catch (error) {
    console.error('Assign bus error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Assign or unassign a bus to a user
router.put('/:userId/assign-bus', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const { busId } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // If busId is null or empty string, unassign the bus
    user.assignedBus = busId || null;
    await user.save();

    const updatedUser = await User.findById(userId).populate('assignedBus');

    res.json({
      message: busId ? 'Bus assigned successfully' : 'Bus unassigned successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Assign bus error:', error);
    res.status(500).json({ message: 'Server error while assigning bus' });
  }
});

// Delete a user by ID
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error during user deletion' });
  }
});


export default router;