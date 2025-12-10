import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, unique: true, required: true },

    // Password optional (Google users do NOT have password)
    password: { type: String, trim: true, default: null },

    // For Google login or social login
    picture: { type: String, default: "" },

    loginType: {
      type: String,
      enum: ["EMAIL", "GOOGLE"],
      default: "EMAIL"
    }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
