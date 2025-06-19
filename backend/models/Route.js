import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
  routeName: {
    type: String,
    required: true,
    trim: true
  },
  startPoint: {
    name: String,
    latitude: Number,
    longitude: Number
  },
  endPoint: {
    name: String,
    latitude: Number,
    longitude: Number
  },
  stops: [{
    name: String,
    latitude: Number,
    longitude: Number,
    estimatedTime: String
  }],
  distance: {
    type: Number,
    default: 0
  },
  estimatedDuration: {
    type: String,
    default: '0 mins'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Route', routeSchema);