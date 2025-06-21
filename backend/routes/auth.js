import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register
router.post(
    '/register',
    [
        body('name')
            .trim()
            .isLength({ min: 2 })
            .withMessage('Name must be at least 2 characters'),
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
        body('role')
            .isIn(['admin', 'student', 'parent', 'staff'])
            .withMessage('Invalid role'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.array(),
                });
            }

            const { name, email, password, role, phone, studentId } = req.body;

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res
                    .status(400)
                    .json({ message: 'User already exists with this email' });
            }

            // Create new user
            const user = new User({
                name,
                email,
                password,
                role,
                phone,
                studentId,
            });

            await user.save();

            // Generate token
            const token = generateToken(user._id);

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                message: 'Server error during registration',
            });
        }
    }
);

// Login
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').exists().withMessage('Password is required'),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: errors.array(),
                });
            }

            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Check password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            // Generate token
            const token = generateToken(user._id);

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login' });
        }
    }
);

// Get current user
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('assignedBus', 'busNumber')
            .populate('parentOf', 'name email');

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Example in routes/auth.js
router.get('/verify', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Failed to verify user' });
    }
});

// GET /api/users
router.get('/users', authenticate, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('assignedBus', 'busNumber');
        res.json({ users });
    } catch (error) {
        console.error('Fetch users error:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// DELETE /api/users/:id
router.delete('/users/:id', authenticate, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

// POST /api/users/assign-bus
router.post('/users/assign-bus', authenticate, async (req, res) => {
    const { userId, busId } = req.body;

    if (!userId || !busId) {
        return res
            .status(400)
            .json({ message: 'User ID and Bus ID are required' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.assignedBus = busId;
        await user.save();

        res.json({ message: 'Bus assigned successfully', user });
    } catch (error) {
        console.error('Assign bus error:', error);
        res.status(500).json({ message: 'Failed to assign bus' });
    }
});

export default router;