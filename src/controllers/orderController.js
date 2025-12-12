import { Order } from "../models/order.js";

// Generate unique order ID
const generateOrderId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD${timestamp}${random}`;
};

// Place order
export const placeOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      deliveryDetails,
      deliveryDate,
      deliveryTime,
      paymentMethod,
      totalAmount,
      deliveryCharge
    } = req.body;

    // Validation
    if (!userId || !cartItems || !deliveryDetails || !deliveryDate || !deliveryTime || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Generate order ID
    const orderId = generateOrderId();

    // Create order
    const order = await Order.create({
      orderId,
      userId,
      cartItems,
      deliveryDetails,
      deliveryDate,
      deliveryTime,
      paymentMethod,
      totalAmount,
      deliveryCharge
    });

    res.status(201).json({
      success: true,
      orderId: order.orderId,
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user orders (optional - future use)
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};