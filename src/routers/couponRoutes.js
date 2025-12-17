import express from 'express';
import { createCoupon, getActiveCoupons, applyCoupon } from '../controllers/couponController.js';
const router = express.Router();
// Middleware to check admin role should be added here
// router.post('/create', verifyAdmin, createCoupon); 
router.post('/create', createCoupon); // For now, public
router.get('/active', getActiveCoupons);
router.post('/apply', applyCoupon);
export default router;