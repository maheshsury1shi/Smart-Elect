import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Candidate from '../src/models/Candidate.js';
import Setting from '../src/models/Setting.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Candidate.deleteMany({});
    await Setting.deleteMany({});

    // Create admin user
    const adminUser = new User({
      email: 'admin@voting.com',
      password: 'Admin@123456', // Will be hashed by schema
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user created: admin@voting.com / Admin@123456');

    // Create sample candidates
    const candidates = [
      {
        name: 'Dr. Rajesh Kumar',
        party: 'National Democratic Alliance',
        symbol: '🌾',
        manifesto: 'Focused on agricultural development, education reform, and healthcare accessibility. Committed to sustainable growth and empowering rural communities.',
        photo: null,
        voteCount: 0,
      },
      {
        name: 'Ms. Priya Singh',
        party: 'United Progressive Alliance',
        symbol: '✋',
        manifesto: 'Dedicated to social justice, environmental protection, and inclusive economic policies. Believes in secular governance and minority rights.',
        photo: null,
        voteCount: 0,
      },
      {
        name: 'Mr. Amit Patel',
        party: 'Bharatiya Janata Party',
        symbol: '🔔',
        manifesto: 'Advocate for technological advancement, infrastructure development, and national security. Vision for a unified and prosperous nation.',
        photo: null,
        voteCount: 0,
      },
    ];

    await Candidate.insertMany(candidates);
    console.log('Sample candidates created');

    // Create settings
    const setting = new Setting({
      key: 'results_declared',
      value: false,
      updatedAt: new Date(),
    });

    await setting.save();
    console.log('Settings initialized');

    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
