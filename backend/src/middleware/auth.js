import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Setting from '../models/Setting.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({ message: 'Invalid authorization header format. Use: Bearer <token>' });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      req.userRole = decoded.role;
      
      // Check if user still exists and is active
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      if (!user.isActive) {
        return res.status(403).json({ message: 'Your account has been deactivated by admin' });
      }

      // Check if results are declared for regular voters
      if (user.role === 'user') {
        const setting = await Setting.findOne({ key: 'results_declared' });
        if (setting && setting.value === true) {
          return res.status(403).json({ message: 'Election results have been declared. Voting is closed' });
        }
      }
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      } else {
        return res.status(401).json({ message: 'Token verification failed' });
      }
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (!req.userId || !req.userRole) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Admin access required - insufficient permissions' });
  }

  next();
};
