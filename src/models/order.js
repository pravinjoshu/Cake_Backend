import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    cartItems: [
      {
        cakeName: String,
        variant: String,
        weight: String,
        price: Number,
        quantity: Number,
        nameOnCake: String
      }
    ],

    deliveryDetails: {
      fullName: String,
      phone: String,
      email: String,
      whatsapp: String,
      address: {
        flatNo: String,
        street: String,
        landmark: String,
        city: String,
        pincode: String
      },
      instructions: String
    },

    deliveryDate: { type: String, required: true },
    deliveryTime: { type: String, required: true },

    paymentMethod: {
      type: String,
      enum: ["online", "cod"],
      required: true
    },

    totalAmount: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending", "confirmed", "delivered", "cancelled"],
      default: "pending"
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
