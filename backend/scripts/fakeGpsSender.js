import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Fake GPS coordinates for simulation (NYC area)
const routes = [
  {
    busId: null,
    coordinates: [
      { lat: 13.0827, lng: 80.2707 }, // Chennai Central
      { lat: 13.0674, lng: 80.2376 }, // Marina Beach
      { lat: 13.0524, lng: 80.2508 }, // Anna Salai
      { lat: 13.0352, lng: 80.2089 }, // Guindy
      { lat: 12.9908, lng: 80.2337 }, // Velachery
      { lat: 12.9716, lng: 80.2214 }, // Medavakkam
    ]
  }
];

class FakeGPSSender {
    constructor() {
        this.currentPositions = new Map();
        this.buses = [];
    }

    async initialize() {
        try {
            console.log('🚀 Initializing Fake GPS Sender...');

            // For demo purposes, we'll create some fake bus IDs
            // In a real scenario, you'd fetch actual bus IDs from the API
            this.buses = [
                '68541a798ee048aa53db386b', // Fake MongoDB ObjectId
                '68541aa8c037f4fa023d928a',
                '68541ab4c037f4fa023d929a',
            ];

            // Initialize positions for each bus
            this.buses.forEach((busId, index) => {
                const routeIndex = index % routes.length;
                this.currentPositions.set(busId, {
                    routeIndex,
                    coordinateIndex: 0,
                    route: routes[routeIndex].coordinates,
                });
            });

            console.log(
                `✅ Initialized ${this.buses.length} buses for GPS simulation`
            );
            this.startSending();
        } catch (error) {
            console.error('❌ Error initializing GPS sender:', error.message);
        }
    }

    generateNextPosition(busId) {
        const position = this.currentPositions.get(busId);
        if (!position) return null;

        const { route, coordinateIndex } = position;
        const currentCoord = route[coordinateIndex];
        const nextCoord = route[(coordinateIndex + 1) % route.length];

        // Simulate movement between coordinates
        const progress = Math.random() * 0.1; // Small random movement
        const lat =
            currentCoord.lat + (nextCoord.lat - currentCoord.lat) * progress;
        const lng =
            currentCoord.lng + (nextCoord.lng - currentCoord.lng) * progress;

        // Update position for next iteration
        if (Math.random() < 0.1) {
            // 10% chance to move to next coordinate
            position.coordinateIndex = (coordinateIndex + 1) % route.length;
        }

        return { lat, lng };
    }

    async sendLocationUpdate(busId, latitude, longitude) {
        try {
            const response = await axios.post(`${API_URL}/location`, {
                busId,
                latitude,
                longitude,
                timestamp: new Date().toISOString(),
            });

            console.log(
                `📍 Updated location for bus ${busId}: ${latitude.toFixed(
                    4
                )}, ${longitude.toFixed(4)}`
            );
        } catch (error) {
            console.error(
                `❌ Error sending location for bus ${busId}:`,
                error.response?.data?.message || error.message
            );
        }
    }

    startSending() {
        console.log('🎯 Starting GPS simulation...');

        setInterval(() => {
            this.buses.forEach((busId) => {
                const position = this.generateNextPosition(busId);
                if (position) {
                    this.sendLocationUpdate(busId, position.lat, position.lng);
                }
            });
        }, 3000); // Send updates every 3 seconds

        console.log(
            '✅ GPS simulation started - sending updates every 3 seconds'
        );
    }
}

// Start the GPS sender
const gpsSender = new FakeGPSSender();
gpsSender.initialize();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping GPS sender...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping GPS sender...');
    process.exit(0);
});
