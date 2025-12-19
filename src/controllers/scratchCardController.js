import ScratchCard from '../models/ScratchCard.js';
import UserCoupon from '../models/UserCoupon.js';
import Coupon from '../models/Coupon.js';
// Generate Scratch Card
export const generateScratchCard = async (req, res) => {
    try {
        const { userId, orderId } = req.body;
        // 1. Try to find EXCLUSIVE reward coupons
        let coupons = await Coupon.find({ 
            isActive: true, 
            isRewardOnly: true, 
            expiryDate: { $gt: new Date() } 
        });
        // 2. FALLBACK: If no exclusive coupons, pick any active coupon
        if (coupons.length === 0) {
            coupons = await Coupon.find({ 
                isActive: true, 
                expiryDate: { $gt: new Date() } 
            });
        }
        if (coupons.length === 0) return res.status(404).json({ message: "No active coupons available in DB" });
        const randomCoupon = coupons[Math.floor(Math.random() * coupons.length)];
        const scratchCard = new ScratchCard({
            userId,
            orderId,
            couponId: randomCoupon._id,
            rewardText: randomCoupon.discountType === 'PERCENTAGE' 
                ? `${randomCoupon.discountValue}% OFF` 
                : `₹${randomCoupon.discountValue} OFF`,
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        await scratchCard.save();
        res.status(201).json({ success: true, scratchCard });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Get user scratch cards
export const getUserScratchCards = async (req, res) => {
    try {
        const cards = await ScratchCard.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json({ success: true, cards });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Mark as revealed
export const revealScratchCard = async (req, res) => {
    try {
        const card = await ScratchCard.findByIdAndUpdate(req.params.id, { isScratched: true }, { new: true });
        res.json({ success: true, card });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Claim the reward
export const claimReward = async (req, res) => {
    try {
        const card = await ScratchCard.findById(req.params.id);
        if (!card) return res.status(404).json({ message: "Card not found" });
        if (card.isClaimed) return res.status(400).json({ message: "Already claimed" });
        if (new Date() > card.expiryDate) return res.status(400).json({ message: "Card expired" });
        const userCoupon = new UserCoupon({
            userId: card.userId,
            couponId: card.couponId,
            scratchCardId: card._id
        });
        await userCoupon.save();
        card.isClaimed = true;
        await card.save();
        res.json({ success: true, message: "Coupon claimed successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// Get claimed but unused coupons
export const getUserCoupons = async (req, res) => {
    try {
        const userCoupons = await UserCoupon.find({ userId: req.params.userId, isUsed: false })
            .populate('couponId');
        res.json({ success: true, userCoupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};