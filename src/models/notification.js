import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["NEW_ORDER", "ORDER_ACCEPTED", "ORDER_REJECTED"],
      default: "NEW_ORDER",
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    // ✅ Accept button
    isAccepted: {
      type: Boolean,
      default: false,
    },

    // ✅ Reject button
    isRejected: {
      type: Boolean,
      default: false,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model(
  "Notification",
  notificationSchema
);
