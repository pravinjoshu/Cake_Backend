import mongoose from "mongoose";

const userDetailsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    fullName: { type: String, trim: true, required: true },
    phone: { type: String, trim: true, required: true },
    email: { type: String, trim: true, required: true },

    whatsapp: { type: String, trim: true, default: "" },

    flatNo: { type: String, trim: true, required: true },
    street: { type: String, trim: true, required: true },
    landmark: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, required: true },
    pincode: { type: String, trim: true, required: true },

    instructions: { type: String, trim: true, default: "" },
    paymentMethod: { type: String, enum: ["online", "cod"], default: "online" },

    // auto-generated full address
    address: { type: String, trim: true }
  },
  { timestamps: true }
);

export const UserDetails = mongoose.model("UserDetails", userDetailsSchema);
