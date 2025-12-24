import { UserDetails } from "../models/userDetails.js";
import { Order } from "../models/order.js";

// 🔹 GET SINGLE USER
export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const details = await UserDetails.findOne({ userId });

    if (!details) {
      return res.status(404).json({
        success: false,
        message: "Details not found",
      });
    }

    res.status(200).json({
      success: true,
      details,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 SAVE / UPDATE USER DETAILS
export const saveUserDetails = async (req, res) => {
  try {
    const {
      userId,
      fullName,
      phone,
      email,
      whatsapp,
      flatNo,
      street,
      landmark,
      city,
      pincode,
      instructions,
      paymentMethod,
    } = req.body;

    const address = `${flatNo}, ${street}, ${landmark}, ${city} - ${pincode}`;

    let details = await UserDetails.findOne({ userId });

    if (details) {
      Object.assign(details, {
        fullName,
        phone,
        email,
        whatsapp,
        flatNo,
        street,
        landmark,
        city,
        pincode,
        instructions,
        paymentMethod,
        address,
      });
      await details.save();
    } else {
      details = await UserDetails.create({
        userId,
        fullName,
        phone,
        email,
        whatsapp,
        flatNo,
        street,
        landmark,
        city,
        pincode,
        instructions,
        paymentMethod,
        address,
      });
    }

    res.status(200).json({
      success: true,
      message: "Details saved successfully",
      details,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 GET ALL CUSTOMERS (NEW → OLD SORTED)
export const getAllUserDetails = async (req, res) => {
  try {
    // 🔥 SORTED HERE
    const users = await UserDetails.find().sort({ createdAt: -1 });

    const usersWithOrderStats = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ userId: user.userId });

        const totalOrders = orders.length;
        const totalSpent = orders.reduce(
          (sum, order) => sum + order.totalAmount,
          0
        );

        return {
          ...user.toObject(),
          totalOrders,
          totalSpent,
        };
      })
    );

    res.status(200).json({
      success: true,
      details: usersWithOrderStats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
