import express from 'express';
import { register, login, getMe, voterLogin, getVoterProfile } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.post('/voter-login', voterLogin);
router.get('/voter-profile', authMiddleware, getVoterProfile);

export default router;
