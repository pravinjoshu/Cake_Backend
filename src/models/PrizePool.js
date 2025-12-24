import mongoose from 'mongoose';

const prizePoolSchema = new mongoose.Schema({
  prizeName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  couponId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    default: null // Null for "Better luck next time" pools
  },
  totalQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  usedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Admin user ID
  }
}, { timestamps: true });

// Index for fast queries
prizePoolSchema.index({ isActive: 1, expiryDate: 1 });

// Instance method: Check if prizes are available
prizePoolSchema.methods.hasAvailablePrizes = function() {
  const now = new Date();
  return this.isActive && 
         this.expiryDate > now && 
         this.usedQuantity < this.totalQuantity &&
         this.couponId !== null; // Must have a linked coupon
};

// Instance method: Get remaining quantity
prizePoolSchema.methods.getRemainingQuantity = function() {
  return Math.max(0, this.totalQuantity - this.usedQuantity);
};

// Static method: Atomically allocate a prize from the pool
// Returns the updated pool if successful, null if no prizes available
prizePoolSchema.statics.allocatePrize = async function(poolId) {
  const now = new Date();
  
  // Atomic operation: increment usedQuantity only if conditions are met
  const updatedPool = await this.findOneAndUpdate(
    {
      _id: poolId,
      isActive: true,
      expiryDate: { $gt: now },
      $expr: { $lt: ['$usedQuantity', '$totalQuantity'] } // usedQuantity < totalQuantity
    },
    {
      $inc: { usedQuantity: 1 }
    },
    {
      new: true // Return updated document
    }
  ).populate('couponId');
  
  return updatedPool;
};

// Static method: Find available prize pool
// Returns the first active pool with available prizes
prizePoolSchema.statics.findAvailablePool = async function() {
  const now = new Date();
  
  const pool = await this.findOne({
    isActive: true,
    expiryDate: { $gt: now },
    couponId: { $ne: null }, // Must have a coupon
    $expr: { $lt: ['$usedQuantity', '$totalQuantity'] }
  })
  .sort({ createdAt: 1 }) // First-come, first-served (oldest pool first)
  .populate('couponId');
  
  return pool;
};

const PrizePool = mongoose.model('PrizePool', prizePoolSchema);

export default PrizePool;
