import mongoose from 'mongoose';

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        // Modern mongoose options
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        retryWrites: true,
      });

      console.log(`✓ MongoDB connected successfully`);
      console.log(`  Host: ${conn.connection.host}`);
      console.log(`  Database: ${conn.connection.name}`);
      
      // Initialize indexes
      await initializeIndexes();
      
      return conn;
    } catch (error) {
      retries++;
      console.error(`MongoDB connection attempt ${retries}/${maxRetries} failed:`);
      console.error(`  Error: ${error.message}`);

      if (retries < maxRetries) {
        console.log(`  Retrying in 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      } else {
        console.error(`\n✗ Failed to connect to MongoDB after ${maxRetries} attempts`);
        console.error(`\n🔍 Troubleshooting steps:`);
        console.error(`  1. Ensure MongoDB is running`);
        console.error(`  2. Check MONGODB_URI in .env: ${process.env.MONGODB_URI}`);
        console.error(`  3. Verify MongoDB is accessible on localhost:27017`);
        console.error(`\n  Windows: net start MongoDB`);
        console.error(`  Mac: brew services start mongodb-community`);
        console.error(`  Linux: sudo systemctl start mongodb`);
        process.exit(1);
      }
    }
  }
};

const initializeIndexes = async () => {
  try {
    const db = mongoose.connection;
    
    // Create indexes for performance
    db.collection('users').createIndex({ email: 1 }, { unique: true });
    db.collection('profiles').createIndex({ userId: 1 }, { unique: true });
    db.collection('profiles').createIndex({ tokenNumber: 1 }, { unique: true });
    db.collection('profiles').createIndex({ aadhaarHash: 1 });
    db.collection('votes').createIndex({ voterId: 1 });
    db.collection('votes').createIndex({ candidateId: 1 });
    
    console.log(`✓ Database indexes initialized`);
  } catch (error) {
    console.warn(`⚠ Warning: Could not initialize indexes: ${error.message}`);
    // Don't fail on index errors, they might already exist
  }
};

export default connectDB;
