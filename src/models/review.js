import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    cakeName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    images: [
      {
        type: String, // image URL
        required: true,
      },
    ],

    // optional (later use)
    isApproved: {
      type: Boolean,
      default: true, // ipo direct show panna true
    },
  },
  { timestamps: true }
);

export const Review = mongoose.model("Review", reviewSchema);
