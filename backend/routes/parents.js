import express from 'express';
import Student from '../models/Student.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get parent's children (Parent only)
router.get('/children', requireRole(['parent']), async (req, res) => {
  try {
    // In a real app, you'd have a proper parent-child relationship
    // For now, we'll simulate by finding students with similar email domain
    const parentEmail = req.user.email;
    const emailDomain = parentEmail.split('@')[1];
    
    const children = await Student.find({ 
      email: { $regex: emailDomain, $options: 'i' },
      isActive: true 
    }).populate('assignedBus');

    res.json(children);
  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get child's bus info (Parent only)
router.get('/child-bus-info/:childId', requireRole(['parent']), async (req, res) => {
  try {
    const student = await Student.findById(req.params.childId)
      .populate({
        path: 'assignedBus',
        populate: [
          { path: 'driver' },
          { path: 'route' }
        ]
      });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.assignedBus) {
      return res.status(404).json({ message: 'No bus assigned to this student' });
    }

    res.json(student.assignedBus);
  } catch (error) {
    console.error('Error fetching child bus info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;