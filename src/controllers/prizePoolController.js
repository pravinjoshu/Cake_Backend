import PrizePool from '../models/PrizePool.js';
import Coupon from '../models/Coupon.js';

// Create a new prize pool (Admin only)
export const createPrizePool = async (req, res) => {
  try {
    const { prizeName, description, couponId, totalQuantity, expiryDate } = req.body;

    // Validate required fields
    if (!prizeName || !totalQuantity || !expiryDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Prize name, total quantity, and expiry date are required' 
      });
    }

    // If couponId provided, verify it exists
    if (couponId) {
      const coupon = await Coupon.findById(couponId);
      if (!coupon) {
        return res.status(404).json({ 
          success: false, 
          message: 'Coupon not found' 
        });
      }
    }

    // Create prize pool
    const prizePool = new PrizePool({
      prizeName,
      description: description || '',
      couponId: couponId || null,
      totalQuantity,
      expiryDate: new Date(expiryDate),
      createdBy: req.user?._id || null // Set from auth middleware if available
    });

    await prizePool.save();

    // Populate coupon details
    await prizePool.populate('couponId');

    res.status(201).json({ 
      success: true, 
      message: 'Prize pool created successfully',
      prizePool 
    });
  } catch (error) {
    console.error('Create prize pool error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all prize pools with statistics
export const getAllPrizePools = async (req, res) => {
  try {
    const pools = await PrizePool.find()
      .populate('couponId')
      .populate('createdBy', 'email name')
      .sort({ createdAt: -1 });

    // Add calculated fields
    const poolsWithStats = pools.map(pool => ({
      ...pool.toObject(),
      remainingQuantity: pool.getRemainingQuantity(),
      hasAvailablePrizes: pool.hasAvailablePrizes()
    }));

    res.json({ 
      success: true, 
      count: pools.length,
      prizePools: poolsWithStats 
    });
  } catch (error) {
    console.error('Get all prize pools error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a single prize pool by ID
export const getPrizePoolById = async (req, res) => {
  try {
    const pool = await PrizePool.findById(req.params.id)
      .populate('couponId')
      .populate('createdBy', 'email name');

    if (!pool) {
      return res.status(404).json({ 
        success: false, 
        message: 'Prize pool not found' 
      });
    }

    const poolWithStats = {
      ...pool.toObject(),
      remainingQuantity: pool.getRemainingQuantity(),
      hasAvailablePrizes: pool.hasAvailablePrizes()
    };

    res.json({ success: true, prizePool: poolWithStats });
  } catch (error) {
    console.error('Get prize pool error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update prize pool (Admin only)
export const updatePrizePool = async (req, res) => {
  try {
    const { prizeName, description, isActive, expiryDate } = req.body;
    const updateFields = {};

    // Only allow updating certain fields
    if (prizeName !== undefined) updateFields.prizeName = prizeName;
    if (description !== undefined) updateFields.description = description;
    if (isActive !== undefined) updateFields.isActive = isActive;
    if (expiryDate !== undefined) updateFields.expiryDate = new Date(expiryDate);

    const pool = await PrizePool.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('couponId');

    if (!pool) {
      return res.status(404).json({ 
        success: false, 
        message: 'Prize pool not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Prize pool updated successfully',
      prizePool: pool 
    });
  } catch (error) {
    console.error('Update prize pool error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Deactivate prize pool (Admin only)
export const deactivatePrizePool = async (req, res) => {
  try {
    const pool = await PrizePool.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!pool) {
      return res.status(404).json({ 
        success: false, 
        message: 'Prize pool not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Prize pool deactivated successfully',
      prizePool: pool 
    });
  } catch (error) {
    console.error('Deactivate prize pool error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get prize pool statistics (Admin only)
export const getPrizePoolStats = async (req, res) => {
  try {
    const pool = await PrizePool.findById(req.params.id)
      .populate('couponId');

    if (!pool) {
      return res.status(404).json({ 
        success: false, 
        message: 'Prize pool not found' 
      });
    }

    // Import ScratchCard model here to avoid circular dependency
    const ScratchCard = (await import('../models/ScratchCard.js')).default;

    // Get all scratch cards linked to this pool
    const scratchCards = await ScratchCard.find({ prizePoolId: pool._id })
      .populate('userId', 'email name')
      .populate('orderId', 'orderId')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      totalQuantity: pool.totalQuantity,
      usedQuantity: pool.usedQuantity,
      remainingQuantity: pool.getRemainingQuantity(),
      isActive: pool.isActive,
      hasAvailablePrizes: pool.hasAvailablePrizes(),
      expiryDate: pool.expiryDate,
      linkedCoupon: pool.couponId,
      
      // Scratch card breakdown
      scratchCardStats: {
        total: scratchCards.length,
        created: scratchCards.filter(sc => sc.status === 'CREATED').length,
        revealed: scratchCards.filter(sc => sc.status === 'REVEALED').length,
        claimed: scratchCards.filter(sc => sc.status === 'CLAIMED').length,
        expired: scratchCards.filter(sc => sc.status === 'EXPIRED').length
      },
      
      scratchCards: scratchCards.map(sc => ({
        _id: sc._id,
        userId: sc.userId,
        orderId: sc.orderId,
        status: sc.status,
        isWinning: sc.isWinning,
        createdAt: sc.createdAt
      }))
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get prize pool stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
