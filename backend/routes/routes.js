import express from 'express';
import Route from '../models/Route.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all routes
router.get('/', async (req, res) => {
  try {
    const routes = await Route.find({ isActive: true }).sort({ name: 1 });
    res.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get route by ID
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    
    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }
    
    res.json(route);
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new route (Admin only)
router.post('/', requireRole(['admin']), async (req, res) => {
  try {
    const { name, description, stops } = req.body;

    const route = new Route({
      name,
      description,
      stops
    });

    await route.save();
    res.status(201).json(route);
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update route (Admin only)
router.put('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const { name, description, stops } = req.body;

    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { name, description, stops },
      { new: true }
    );

    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json(route);
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete route (Admin only)
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;