import express from 'express';
import {
  getResultsStatus,
  declareResults,
  resetElection,
  getResults,
} from '../controllers/resultsController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/status', getResultsStatus);
router.get('/', getResults);
router.post('/declare', authMiddleware, adminMiddleware, declareResults);
router.post('/reset', authMiddleware, adminMiddleware, resetElection);

export default router;
