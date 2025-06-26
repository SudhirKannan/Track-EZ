import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Bus from '../models/Bus.js'; // 👈 Add this

dotenv.config();

const setupAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Admin Setup
    const existingAdmin = await User.findOne({ role: 'admin' });

    const hashedPassword = await bcrypt.hash('1234567890', 10);

    if (existingAdmin) {
      console.log('Admin already exists:', existingAdmin.email);

      await User.findByIdAndUpdate(existingAdmin._id, {
        name: 'admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        phone: '0987654321',
        role: 'admin',
      });

      console.log('✅ Admin updated');
    } else {
      const adminUser = new User({
        name: 'admin',
        email: 'admin@gmail.com',
        password: hashedPassword,
        phone: '0987654321',
        role: 'admin',
      });

      await adminUser.save();
      console.log('✅ Admin created');
    }

    // Demote other rogue admins
    const otherAdmins = await User.find({
      role: 'admin',
      email: { $ne: 'admin@gmail.com' },
    });

    for (const admin of otherAdmins) {
      await User.findByIdAndUpdate(admin._id, { role: 'user' });
      console.log(`Demoted ${admin.email} to user`);
    }

    // 🚍 Seed sample buses if none exist
    const existingBuses = await Bus.countDocuments();
    if (existingBuses === 0) {
      await Bus.insertMany([
        { number: 'TN 01 AB 1234', driver: null },
        { number: 'TN 07 CD 5678', driver: null },
        { number: 'TN 05 EF 9012', driver: null },
      ]);
      console.log('✅ Seeded 3 sample buses');
    } else {
      console.log(`🚍 ${existingBuses} buses already exist. Skipping seeding.`);
    }

    console.log('🎉 Admin setup complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up admin:', error.message);
    process.exit(1);
  }
};

setupAdmin();
