import express from 'express';
import {
  getProfileByUserId,
  getAllProfiles,
  deleteProfile,
  verifyVoterByFace,
} from '../controllers/profileController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/verify-face', verifyVoterByFace);
router.get('/:userId', getProfileByUserId);
router.get('/', authMiddleware, adminMiddleware, getAllProfiles);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProfile);

export default router;
