import express from 'express';
import Student from '../models/Student.js';
import Bus from '../models/Bus.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all students (Admin only)
router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    const students = await Student.find({ isActive: true })
      .populate('assignedBus')
      .sort({ name: 1 });
    
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student's bus info (Student only)
router.get('/bus-info', requireRole(['student']), async (req, res) => {
  try {
    const student = await Student.findOne({ 
      email: req.user.email 
    }).populate({
      path: 'assignedBus',
      populate: [
        { path: 'driver' },
        { path: 'route' }
      ]
    });

    if (!student || !student.assignedBus) {
      return res.status(404).json({ message: 'No bus assigned' });
    }

    res.json(student.assignedBus);
  } catch (error) {
    console.error('Error fetching bus info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new student (Admin only)
router.post('/', requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, studentId, assignedBus } = req.body;

    // Check if student ID or email already exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { studentId }]
    });
    
    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student with this email or student ID already exists' 
      });
    }

    const student = new Student({
      name,
      email,
      studentId,
      assignedBus: assignedBus || null
    });

    await student.save();
    await student.populate('assignedBus');
    
    res.status(201).json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student (Admin only)
router.put('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { name, email, studentId, assignedBus } = req.body;

    // Check if student ID or email already exists (excluding current student)
    const existingStudent = await Student.findOne({
      $or: [{ email }, { studentId }],
      _id: { $ne: req.params.id }
    });
    
    if (existingStudent) {
      return res.status(400).json({ 
        message: 'Student with this email or student ID already exists' 
      });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, studentId, assignedBus: assignedBus || null },
      { new: true }
    ).populate('assignedBus');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete student (Admin only)
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;