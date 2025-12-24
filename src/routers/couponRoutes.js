import express from 'express';
import { 
  createCoupon, 
  getActiveCoupons, 
  applyCoupon,
  validateUserCoupon,
  applyUserCoupon
} from '../controllers/couponController.js';
import { validateCouponApplication } from '../middleware/validateRequest.js';

const router = express.Router();

// Admin routes
// TODO: Add admin auth middleware to createCoupon route
router.post('/create', createCoupon);

// User routes
router.get('/active', getActiveCoupons);
router.post('/validate', validateUserCoupon); // Validate before checkout
router.post('/apply-user', validateCouponApplication, applyUserCoupon); // Apply at checkout

// Legacy route (backward compatibility)
router.post('/apply', applyCoupon);

export default router;