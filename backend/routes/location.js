import express from 'express';
import Bus from '../models/Bus.js';

const router = express.Router();

// Update bus location (from GPS sender)
router.post('/', async (req, res) => {
  try {
    const { busId, latitude, longitude, timestamp } = req.body;

    if (!busId || !latitude || !longitude) {
      return res.status(400).json({ 
        message: 'Bus ID, latitude, and longitude are required' 
      });
    }

    // Update bus location in database
    const bus = await Bus.findByIdAndUpdate(
      busId,
      {
        currentLocation: {
          latitude,
          longitude,
          timestamp: timestamp || new Date()
        }
      },
      { new: true }
    );

    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    // Emit location update to connected clients via Socket.IO
    const io = req.app.get('io');
    io.emit('locationUpdate', {
      busId,
      latitude,
      longitude,
      timestamp: timestamp || new Date()
    });

    res.json({ 
      message: 'Location updated successfully',
      location: bus.currentLocation
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bus location
router.get('/:busId', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.busId);
    
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    res.json({
      busId: bus._id,
      location: bus.currentLocation
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;