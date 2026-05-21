import express from 'express';
import {
  getAllCandidates,
  addCandidate,
  deleteCandidate,
} from '../controllers/candidateController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllCandidates);
router.post('/', authMiddleware, adminMiddleware, addCandidate);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCandidate);

export default router;
