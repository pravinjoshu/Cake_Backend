import mongoose from 'mongoose';

const scratchCardSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    required: true 
  },
  prizePoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PrizePool',
    default: null // Null for non-winning cards
  },
  couponId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Coupon',
    default: null // Null for "Better luck next time" cards
  },
  rewardText: { 
    type: String, 
    required: true 
  },
  isWinning: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['CREATED', 'REVEALED', 'CLAIMED', 'EXPIRED'],
    default: 'CREATED'
  },
  expiryDate: { 
    type: Date, 
    required: true 
  }
}, { timestamps: true });

// Index for efficient queries
scratchCardSchema.index({ userId: 1, status: 1 });
scratchCardSchema.index({ orderId: 1 });

// Instance method: Reveal the scratch card
scratchCardSchema.methods.reveal = async function() {
  if (this.status !== 'CREATED') {
    throw new Error('Card has already been revealed');
  }
  
  if (this.isExpired()) {
    this.status = 'EXPIRED';
    await this.save();
    throw new Error('Card has expired');
  }
  
  this.status = 'REVEALED';
  return await this.save();
};

// Instance method: Claim the reward
scratchCardSchema.methods.claim = async function() {
  if (this.status !== 'REVEALED') {
    throw new Error('Card must be revealed before claiming');
  }
  
  if (!this.isWinning) {
    throw new Error('This card has no reward to claim');
  }
  
  if (this.isExpired()) {
    this.status = 'EXPIRED';
    await this.save();
    throw new Error('Card has expired');
  }
  
  this.status = 'CLAIMED';
  return await this.save();
};

// Instance method: Check if expired
scratchCardSchema.methods.isExpired = function() {
  return new Date() > this.expiryDate;
};

// Instance method: Check if claimable
scratchCardSchema.methods.isClaimable = function() {
  return this.status === 'REVEALED' && 
         this.isWinning && 
         !this.isExpired();
};

export default mongoose.model('ScratchCard', scratchCardSchema);
