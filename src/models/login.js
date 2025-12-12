import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, unique: true, required: true },

    // Password optional (Google users do NOT have password)
    password: { type: String, trim: true, default: null },

     
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
