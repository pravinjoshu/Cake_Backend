import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    cartItems: [
      {
        cakeName: String,
        variant: String,
        weight: String,
        price: Number,
        quantity: Number,
        nameOnCake: String,
      },
    ],

    deliveryDetails: {
      fullName: String,
      phone: String,
      email: String,
      whatsapp: String,
      cakeWishes:String,
      deliveryDate:String,
      deliveryTime:String,
      address: {
        flatNo: String,
        street: String,
        landmark: String,
        city: String,
        pincode: String,
      },
      instructions: String,
    },

    

    paymentMethod: {
      type: String,
      enum: ["online", "cod"],
      required: true,
    },

    totalAmount: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },

    // Coupon & Discount tracking
    appliedCouponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    finalAmount: {
      type: Number,
      required: true
    },

    // Scratch card tracking
    isScratchCardGenerated: {
      type: Boolean,
      default: false
    },

    // ✅ FIXED: Changed "completed" to "delivered"
    status: {
      type: String,
      enum: ["pending", "ready", "delivered", "cancelled"],
      default: "pending",
    },
    notificationstatus: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
