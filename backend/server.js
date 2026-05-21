import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import authRoutes from './src/routes/authRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';
import candidateRoutes from './src/routes/candidateRoutes.js';
import voteRoutes from './src/routes/voteRoutes.js';
import resultsRoutes from './src/routes/resultsRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
let dbConnected = false;

(async () => {
  try {
    await connectDB();
    dbConnected = true;
  } catch (error) {
    console.error('Failed to initialize database connection');
    process.exit(1);
  }

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/profiles', profileRoutes);
  app.use('/api/candidates', candidateRoutes);
  app.use('/api/votes', voteRoutes);
  app.use('/api/results', resultsRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Server is running',
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    });
  });

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      message: `Route ${req.method} ${req.path} not found`,
    });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      message: err.message || 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  });

  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('✓ Election Voting System - Backend Server');
    console.log('='.repeat(50));
    console.log(`📍 Server running on port ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    console.log(`💾 Database: Connected`);
    console.log(`⚙️  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(50) + '\n');
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n✗ Port ${PORT} is already in use`);
      console.error(`\n🔍 Solutions:`);
      console.error(`  1. Change PORT in backend/.env`);
      console.error(`  2. Kill process using port:`);
      console.error(`     Windows: netstat -ano | findstr :${PORT}`);
      console.error(`     Mac/Linux: lsof -i :${PORT}`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n\nShutting down gracefully...');
    server.close(async () => {
      try {
        const mongoose = (await import('mongoose')).default;
        await mongoose.connection.close();
        console.log('✓ Database connection closed');
      } catch (err) {
        console.error('Error closing database:', err);
      }
      console.log('✓ Server stopped');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('✗ Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
})();
