import Coupon from '../models/Coupon.js';
// 1. Create Coupon (Admin Only)
export const createCoupon = async (req, res) => {
  try {
    const { 
      code, discountType, discountValue, minOrderValue, 
      maxDiscountAmount, expiryDate, usageLimit, isRewardOnly 
    } = req.body;
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    const newCoupon = new Coupon({
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      expiryDate,
      usageLimit,
      isRewardOnly: isRewardOnly || false
    });
    await newCoupon.save();
    res.status(201).json({ message: 'Coupon created successfully', coupon: newCoupon });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};
// 2. Get All Active Coupons (For Users/Admin)
export const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      isRewardOnly: false,
      expiryDate: { $gt: now }
    });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching coupons' });
  }
};
// 3. Apply Coupon (For Checkout)
export const applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid Coupon Code' });
    }
    const validation = coupon.isValid(orderAmount);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }
    const discountAmount = coupon.calculateDiscount(orderAmount);
    const finalPrice = orderAmount - discountAmount;
    res.status(200).json({
      success: true,
      discountAmount,
      finalPrice,
      code: coupon.code,
      message: 'Coupon Applied Successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error applying coupon', error: error.message });
  }
};