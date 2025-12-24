import mongoose from 'mongoose';
const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['PERCENTAGE', 'FLAT'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  minOrderValue: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: {
    type: Number, // Only applicable for PERCENTAGE
    default: null
  },
  expiryDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number, // Total number of times this coupon can be used
    default: null
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isRewardOnly: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });
// Check if coupon is valid
couponSchema.methods.isValid = function(orderAmount) {
  const now = new Date();
  
  if (!this.isActive) return { valid: false, message: 'Coupon is inactive' };
  if (this.expiryDate < now) return { valid: false, message: 'Coupon has expired' };
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) return { valid: false, message: 'Coupon usage limit reached' };
  if (orderAmount < this.minOrderValue) return { valid: false, message: `Minimum order value of ₹${this.minOrderValue} required` };
  
  return { valid: true };
};
// Calculate Discount Amount
couponSchema.methods.calculateDiscount = function(orderAmount) {
  let discount = 0;
  
  if (this.discountType === 'FLAT') {
    discount = this.discountValue;
  } else if (this.discountType === 'PERCENTAGE') {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maxDiscountAmount) {
      discount = Math.min(discount, this.maxDiscountAmount);
    }
  }
  
  // Ensure discount doesn't exceed order amount
  return Math.min(discount, orderAmount);
};

// Use coupon - atomically increment usedCount
couponSchema.methods.useCoupon = async function() {
  const result = await mongoose.model('Coupon').findByIdAndUpdate(
    this._id,
    { $inc: { usedCount: 1 } },
    { new: true }
  );
  return result;
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;