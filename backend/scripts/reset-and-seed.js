#!/usr/bin/env node

/**
 * Complete Database Reset and Fresh Seed
 * Run this to clear all old data and start fresh
 */

import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import User from '../src/models/User.js';
import Profile from '../src/models/Profile.js';
import Candidate from '../src/models/Candidate.js';
import Vote from '../src/models/Vote.js';
import Setting from '../src/models/Setting.js';

const hashAadhaar = (aadhaar) => {
  const cleaned = String(aadhaar).replace(/\D/g, '').slice(0, 12);
  return crypto.createHash('sha256').update(cleaned).digest('hex');
};

const generateTokenNumber = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

async function resetAndSeed() {
  try {
    console.log('🔄 Starting complete database reset...\n');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/voting-system';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');
    
    // Delete all data
    console.log('🗑️  Clearing all collections...');
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Candidate.deleteMany({});
    await Vote.deleteMany({});
    await Setting.deleteMany({});
    console.log('✅ All data cleared\n');
    
    // Create admin user
    console.log('👤 Creating admin user...');
    const adminUser = new User({
      email: 'admin@voting.com',
      password: 'Admin@123456',
      role: 'admin',
    });
    await adminUser.save();
    console.log('✅ Admin created: admin@voting.com / Admin@123456\n');
    
    // Create test voter with known Aadhaar
    console.log('📝 Creating test voter...');
    const testAadhaar = '123456789012';
    const aadhaarHash = hashAadhaar(testAadhaar);
    
    const testUser = new User({
      email: 'voter@voting.com',
      password: 'Voter@123456',
      role: 'user',
    });
    await testUser.save();
    
    const testProfile = new Profile({
      userId: testUser._id,
      fullName: 'Test Voter',
      aadhaarHash: aadhaarHash,
      dateOfBirth: new Date('2000-01-15'),
      tokenNumber: generateTokenNumber(),
      phone: '9876543210',
      faceData: {
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        descriptor: Array(128).fill(0.1),
      },
    });
    await testProfile.save();
    
    console.log('✅ Test voter created:');
    console.log(`   Email: voter@voting.com`);
    console.log(`   Password: Voter@123456`);
    console.log(`   Full Name: Test Voter`);
    console.log(`   Token: ${testProfile.tokenNumber}`);
    console.log(`   Aadhaar (for voting): ${testAadhaar}`);
    console.log(`   Aadhaar Hash: ${aadhaarHash}\n`);
    
    // Create candidates
    console.log('🗳️  Creating candidates...');
    const candidates = [
      { name: 'Candidate A', party: 'Party A', photo: '' },
      { name: 'Candidate B', party: 'Party B', photo: '' },
      { name: 'Candidate C', party: 'Party C', photo: '' },
    ];
    
    for (const cand of candidates) {
      const candidate = new Candidate({
        name: cand.name,
        party: cand.party,
        photo: cand.photo,
        votes: 0,
      });
      await candidate.save();
      console.log(`  ✅ ${cand.name} (${cand.party})`);
    }
    
    // Create settings
    console.log('\n⚙️  Creating settings...');
    const setting = new Setting({
      resultsVisible: false,
    });
    await setting.save();
    console.log('✅ Settings created\n');
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ DATABASE RESET COMPLETE!\n');
    console.log('🔐 ADMIN LOGIN:');
    console.log('   Email: admin@voting.com');
    console.log('   Password: Admin@123456\n');
    console.log('🗳️  TEST VOTER LOGIN:');
    console.log('   Email: voter@voting.com');
    console.log('   Password: Voter@123456\n');
    console.log('📋 VOTING CREDENTIALS:');
    console.log(`   Token Number: ${testProfile.tokenNumber}`);
    console.log(`   Aadhaar: ${testAadhaar}`);
    console.log(`   Name: Test Voter`);
    console.log(`   DOB: 2000-01-15`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetAndSeed();
