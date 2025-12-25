import mongoose from "mongoose";
 

const productSchema = new mongoose.Schema(
  {
    cakeName: {
      type: String,
      required: true,
      trim: true,
    },

    flavor: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
    },

    weight: {
      type: [String],
      required: true,
    },

    images: [
      {
        type: String, // URL only
        required: true,
      },
    ],

    availability: {
      type: String,
      enum: ["available", "out-of-stock"],
      default: "available",
    },

    stock: {
      type: Number,
      default: 0,
    },
 
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

export default Product;
