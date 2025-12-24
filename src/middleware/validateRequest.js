// Request validation middleware for prize pools and scratch cards

export const validatePrizePoolCreation = (req, res, next) => {
  const { prizeName, totalQuantity, expiryDate } = req.body;

  const errors = [];

  if (!prizeName || typeof prizeName !== 'string' || prizeName.trim().length === 0) {
    errors.push('Prize name is required and must be a non-empty string');
  }

  if (!totalQuantity || typeof totalQuantity !== 'number' || totalQuantity <= 0) {
    errors.push('Total quantity must be a positive number');
  }

  if (!expiryDate) {
    errors.push('Expiry date is required');
  } else {
    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) {
      errors.push('Invalid expiry date format');
    } else if (expiry <= new Date()) {
      errors.push('Expiry date must be in the future');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors 
    });
  }

  next();
};

export const validateScratchCardGeneration = (req, res, next) => {
  const { userId, orderId } = req.body;

  const errors = [];

  if (!userId || typeof userId !== 'string') {
    errors.push('User ID is required and must be a valid string');
  }

  if (!orderId || typeof orderId !== 'string') {
    errors.push('Order ID is required and must be a valid string');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors 
    });
  }

  next();
};

export const validateCouponApplication = (req, res, next) => {
  const { userId, couponCode, orderId, orderAmount } = req.body;

  const errors = [];

  if (!userId || typeof userId !== 'string') {
    errors.push('User ID is required');
  }

  if (!couponCode || typeof couponCode !== 'string') {
    errors.push('Coupon code is required');
  }

  if (!orderId || typeof orderId !== 'string') {
    errors.push('Order ID is required');
  }

  if (!orderAmount || typeof orderAmount !== 'number' || orderAmount <= 0) {
    errors.push('Order amount must be a positive number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors 
    });
  }

  next();
};
