import mongoose from 'mongoose';
const userCouponSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true },
    scratchCardId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScratchCard' },
    isUsed: { type: Boolean, default: false },
    usedAt: { type: Date },
    assignedAt: { type: Date, default: Date.now }
});
export default mongoose.model('UserCoupon', userCouponSchema);