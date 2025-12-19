import express from 'express';
import Coupon from '../models/Coupon.js';
import { 
    generateScratchCard, 
    getUserScratchCards, 
    revealScratchCard, 
    claimReward, 
    getUserCoupons 
} from '../controllers/scratchCardController.js';
const router = express.Router();
router.post('/generate', generateScratchCard);
router.get('/user/:userId', getUserScratchCards);
router.patch('/:id/reveal', revealScratchCard);
router.patch('/:id/claim', claimReward);
router.get('/user-coupons/:userId', getUserCoupons);
// Admin-Only: Get ALL coupons (for the Coupons.jsx admin page)
router.get('/admin/all', async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
export default router;