import express from 'express';
import { castVote, getAllVotes } from '../controllers/voteController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Vote casting requires authentication and verification
router.post('/', authMiddleware, castVote);
// Only admins can view all votes
router.get('/', authMiddleware, adminMiddleware, getAllVotes);

export default router;
