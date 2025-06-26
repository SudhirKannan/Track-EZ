import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config();

const setupAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });

        if (existingAdmin) {
            console.log('Admin account already exists:', existingAdmin.email);

            // Update existing admin to the specified credentials
            const hashedPassword = await bcrypt.hash('1234567890', 10);

            await User.findByIdAndUpdate(existingAdmin._id, {
                name: 'admin',
                email: 'admin@gmail.com',
                password: hashedPassword,
                phone: '0987654321',
                role: 'admin',
            });

            console.log('Admin account updated with new credentials');
        } else {
            // Create new admin account
            const hashedPassword = await bcrypt.hash('1234567890', 10);

            const adminUser = new User({
                name: 'admin',
                email: 'admin@gmail.com',
                password: hashedPassword,
                phone: '0987654321',
                role: 'admin',
            });

            await adminUser.save();
            console.log('Admin account created successfully');
        }

        // Change any other users with admin role to user role
        const otherAdmins = await User.find({
            role: 'admin',
            email: { $ne: 'admin@gmail.com' },
        });

        if (otherAdmins.length > 0) {
            console.log(
                `Found ${otherAdmins.length} other admin accounts, changing them to user role...`
            );

            for (const admin of otherAdmins) {
                await User.findByIdAndUpdate(admin._id, { role: 'user' });
                console.log(`Changed ${admin.email} from admin to user role`);
            }
        }

        console.log('Admin setup completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error setting up admin:', error);
        process.exit(1);
    }
};

setupAdmin();
