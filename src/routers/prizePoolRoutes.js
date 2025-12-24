import express from 'express';
import {
  createPrizePool,
  getAllPrizePools,
  getPrizePoolById,
  updatePrizePool,
  deactivatePrizePool,
  getPrizePoolStats
} from '../controllers/prizePoolController.js';
import { requireAdmin } from '../middleware/adminAuth.js';
import { validatePrizePoolCreation } from '../middleware/validateRequest.js';

const router = express.Router();

// All routes require admin authentication
// Note: Update requireAdmin middleware with your actual auth logic

router.post('/', requireAdmin, validatePrizePoolCreation, createPrizePool);
router.get('/', requireAdmin, getAllPrizePools);
router.get('/:id', requireAdmin, getPrizePoolById);
router.patch('/:id', requireAdmin, updatePrizePool);
router.delete('/:id', requireAdmin, deactivatePrizePool);
router.get('/:id/stats', requireAdmin, getPrizePoolStats);

export default router;
