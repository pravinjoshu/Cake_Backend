import ScratchCard from '../models/ScratchCard.js';
import UserCoupon from '../models/UserCoupon.js';
import Coupon from '../models/Coupon.js';
import PrizePool from '../models/PrizePool.js';
import { Order } from '../models/order.js';

// Generate Scratch Card - Called after order completion
export const generateScratchCard = async (req, res) => {
  try {
    const { userId, orderId } = req.body;

    if (!userId || !orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID and Order ID are required' 
      });
    }

    // 1. Check if order exists and hasn't already generated a scratch card
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    if (order.isScratchCardGenerated) {
      const existingCard = await ScratchCard.findOne({ orderId })
        .populate('couponId')
        .populate('prizePoolId');
        
      if (existingCard) {
        return res.status(200).json({ 
          success: true, 
          message: 'Scratch card already generated for this order',
          scratchCard: {
            _id: existingCard._id,
            status: existingCard.status,
            expiryDate: existingCard.expiryDate,
            isWinning: existingCard.isWinning,
            rewardText: existingCard.rewardText // Return it since it's already generated
          }
        });
      }
    }

    // 2. Get prize pool IDs the user has already won (One user can win each prize pool once)
    const wonPoolIds = await ScratchCard.find({ 
      userId, 
      isWinning: true,
      prizePoolId: { $ne: null }
    }).distinct('prizePoolId');

    // 3. Find an available prize pool the user hasn't won from yet
    const availablePool = await PrizePool.findAvailablePool(wonPoolIds);

    let scratchCard;

    // 🛑 RULE: Random Winners (Not first-come-first-serve)
    const winProbability = availablePool ? (availablePool.winProbability || 0.1) : 0;
    const isRandomWinner = Math.random() < winProbability;

    if (availablePool && isRandomWinner) {
      // 4. Attempt atomic prize allocation
      const allocatedPool = await PrizePool.allocatePrize(availablePool._id);

      if (allocatedPool) {
        // Successfully allocated a prize - create WINNING scratch card
        const rewardText =  `You won ${allocatedPool.prizeName}!`;
        
        scratchCard = new ScratchCard({
          userId,
          orderId,
          prizePoolId: allocatedPool._id,
          couponId: allocatedPool.couponId,
          rewardText,
          isWinning: true,
          status: 'CREATED',
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
        });
      } else {
        // Prize pool exhausted during allocation or random check failed - create non-winning card
        scratchCard = new ScratchCard({
          userId,
          orderId,
          prizePoolId: null,
          couponId: null,
          rewardText: 'Better luck next time 🍀',
          isWinning: false,
          status: 'CREATED',
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
      }
    } else {
      // No available prize pools, already won, or not a random winner - create non-winning card
      scratchCard = new ScratchCard({
        userId,
        orderId,
        prizePoolId: null,
        couponId: null,
        rewardText: 'Better luck next time 🍀',
        isWinning: false,
        status: 'CREATED',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }

    // 4. Save scratch card
    await scratchCard.save();

    // 5. Mark order as having generated scratch card
    order.isScratchCardGenerated = true;
    await order.save();

    res.status(201).json({ 
      success: true, 
      message: 'Scratch card generated successfully',
      scratchCard: {
        _id: scratchCard._id,
        status: scratchCard.status,
        expiryDate: scratchCard.expiryDate,
        isWinning: scratchCard.isWinning,
        rewardText: scratchCard.rewardText
      }
    });
  } catch (error) {
    console.error('Generate scratch card error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user scratch cards
export const getUserScratchCards = async (req, res) => {
  try {
    const cards = await ScratchCard.find({ userId: req.params.userId })
      .populate('couponId')
      .populate('prizePoolId')
      .sort({ createdAt: -1 });

    // Map cards to include user-friendly data
    const cardsData = cards.map(card => ({
      _id: card._id,
      orderId: card.orderId,
      status: card.status,
      isWinning: card.isWinning,
      rewardText: card.rewardText,
      couponId: card.couponId,
      expiryDate: card.expiryDate,
      createdAt: card.createdAt,
      isExpired: card.isExpired(),
      isClaimable: card.isClaimable(),
      isScratched: card.status !== 'CREATED' // Add this field for frontend compatibility
    }));

    res.json({ success: true, count: cards.length, cards: cardsData });
  } catch (error) {
    console.error('Get user scratch cards error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reveal scratch card
export const revealScratchCard = async (req, res) => {
  try {
    const card = await ScratchCard.findById(req.params.id)
      .populate('couponId')
      .populate('prizePoolId');

    if (!card) {
      return res.status(404).json({ 
        success: false, 
        message: 'Scratch card not found' 
      });
    }

    // Idempotency: If already revealed/claimed, just return the card
    if (card.status === 'REVEALED' || card.status === 'CLAIMED') {
       return res.json({ 
        success: true, 
        message: 'Scratch card already revealed',
        card: {
          _id: card._id,
          status: card.status,
          isWinning: card.isWinning,
          rewardText: card.rewardText,
          couponId: card.couponId,
          expiryDate: card.expiryDate,
          isClaimable: card.isClaimable()
        }
      });
    }

    // Use the model's reveal method (handles state transitions)
    await card.reveal();

    res.json({ 
      success: true, 
      message: 'Scratch card revealed',
      card: {
        _id: card._id,
        status: card.status,
        isWinning: card.isWinning,
        rewardText: card.rewardText, // Now visible
        couponId: card.couponId,
        expiryDate: card.expiryDate,
        isClaimable: card.isClaimable()
      }
    });
  } catch (error) {
    console.error('Reveal scratch card error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Claim the reward
export const claimReward = async (req, res) => {
  try {
    const card = await ScratchCard.findById(req.params.id)
      .populate('couponId');

    if (!card) {
      return res.status(404).json({ 
        success: false, 
        message: 'Scratch card not found' 
      });
    }

    // Idempotency: If already claimed, return existing coupon
    if (card.status === 'CLAIMED') {
      const existingUserCoupon = await UserCoupon.findOne({ scratchCardId: card._id })
        .populate('couponId');
      return res.json({ 
        success: true, 
        message: 'Reward already claimed',
        userCoupon: existingUserCoupon 
      });
    }

    // Use the model's claim method (handles validation)
    await card.claim();

    // Create UserCoupon entry
    const userCoupon = new UserCoupon({
      userId: card.userId,
      couponId: card.couponId,
      scratchCardId: card._id
    });
    await userCoupon.save();

    res.json({ 
      success: true, 
      message: 'Coupon claimed successfully! Check your coupons.',
      userCoupon 
    });
  } catch (error) {
    console.error('Claim reward error:', error);
    res.status(400).json({ success: false, message: error.message });
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