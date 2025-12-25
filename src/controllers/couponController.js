import Coupon from '../models/Coupon.js';
import UserCoupon from '../models/UserCoupon.js';
import { Order } from '../models/order.js';

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

// 2. Get All Active Coupons (For Users) - Public coupons only
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

// 3. Validate User's Coupon (Before checkout)
export const validateUserCoupon = async (req, res) => {
  try {
    const { userId, couponCode, orderAmount } = req.body;

    // Find the coupon
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid coupon code' 
      });
    }

    // Check if user has already used this coupon
    if (!coupon.isRewardOnly) {
      // Check for public coupons usage in past orders
      const usedInOrder = await Order.findOne({ 
        userId, 
        appliedCouponId: coupon._id,
        status: { $ne: 'cancelled' } 
      });

      if (usedInOrder) {
        return res.status(403).json({ 
          success: false, 
          message: 'You have already used this coupon code.' 
        });
      }
    } else {
      // Check if user owns and hasn't used this reward coupon
      const userCoupon = await UserCoupon.findOne({ 
        userId, 
        couponId: coupon._id,
        isUsed: false 
      });

      if (!userCoupon) {
        // Double check if they used it already
        const alreadyUsed = await UserCoupon.findOne({ userId, couponId: coupon._id, isUsed: true });
        return res.status(403).json({ 
          success: false, 
          message: alreadyUsed ? 'You have already used this reward.' : 'You do not have access to this coupon' 
        });
      }
    }

    // Validate coupon
    const validation = coupon.isValid(orderAmount);
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: validation.message 
      });
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(orderAmount);
    const finalAmount = orderAmount - discountAmount;

    res.json({
      success: true,
      valid: true,
      discountAmount,
      finalAmount,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    });
  } catch (error) {
    console.error('Validate user coupon error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. Apply User's Coupon to Order (At checkout)
export const applyUserCoupon = async (req, res) => {
  try {
    const { userId, couponCode, orderId, orderAmount } = req.body;

    // Validate inputs
    if (!userId || !couponCode || !orderId || !orderAmount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Find the coupon
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invalid coupon code' 
      });
    }

    // Check if user owns this coupon (for reward-only coupons)
    let userCoupon = null;
    if (coupon.isRewardOnly) {
      userCoupon = await UserCoupon.findOne({ 
        userId, 
        couponId: coupon._id,
        isUsed: false 
      });

      if (!userCoupon) {
        return res.status(403).json({ 
          success: false, 
          message: 'You do not have access to this coupon' 
        });
      }
    }

    // Validate coupon
    const validation = coupon.isValid(orderAmount);
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false, 
        message: validation.message 
      });
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(orderAmount);
    const finalAmount = orderAmount - discountAmount;

    // Update order with coupon details
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        appliedCouponId: coupon._id,
        discountAmount,
        finalAmount
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Mark user coupon as used (if reward coupon)
    if (userCoupon) {
      userCoupon.isUsed = true;
      userCoupon.usedAt = new Date();
      await userCoupon.save();
    }

    // Atomically increment coupon usage count
    await coupon.useCoupon();

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      discountAmount,
      finalAmount,
      order
    });
  } catch (error) {
    console.error('Apply user coupon error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. Legacy Apply Coupon (For backward compatibility - public coupons only)
export const applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid Coupon Code' });
    }

    // Don't allow applying reward-only coupons through this endpoint
    if (coupon.isRewardOnly) {
      return res.status(403).json({ 
        message: 'This is a reward-only coupon. Please use the proper flow.' 
      });
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