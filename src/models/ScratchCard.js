import mongoose from 'mongoose';
const scratchCardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true },
    rewardText: { type: String, required: true },
    isScratched: { type: Boolean, default: false },
    isClaimed: { type: Boolean, default: false },
    expiryDate: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});
export default mongoose.model('ScratchCard', scratchCardSchema);

