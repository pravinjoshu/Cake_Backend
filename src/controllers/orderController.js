import { Order } from "../models/order.js";
import { Notification } from "../models/notification.js";


// Generate unique order ID
const generateOrderId = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD${timestamp}${random}`;
};

 

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

    if (
      !userId ||
      !cartItems ||
      !deliveryDetails ||
      !deliveryDate ||
      !deliveryTime ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const orderIdStr = generateOrderId();

    // 1️⃣ CREATE ORDER
    const order = await Order.create({
      orderId: orderIdStr,
      userId,
      cartItems,
      deliveryDetails,
      deliveryDate,
      deliveryTime,
      paymentMethod,
      totalAmount,
      deliveryCharge,
      status: "pending"
    });

    // 2️⃣ CREATE NOTIFICATION (MATCHES YOUR SCHEMA)
    await Notification.create({
      type: "NEW_ORDER",
      title: "New Order Received",
      message: `Order ${orderIdStr} placed by ${deliveryDetails.fullName} for ₹${totalAmount}`,
      orderId: order._id,   // ✅ ObjectId reference
      isRead: false
    });

    // 3️⃣ RESPONSE
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order.orderId,
      order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// ✅ EXPORT getUserOrders (THIS WAS MISSING)
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order
      .find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

