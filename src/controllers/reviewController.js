import { Review } from "../models/review.js";
import Product from "../models/product.js";

export const addReview = async (req, res) => {
  try {
    const { productId, description, rating ,cakeName} = req.body;
    const userId = req.user._id; // auth middleware irundha

    if (!productId || !description || !rating || !cakeName ) {
      return res.status(400).json({
        success: false,
        message: "Product, description and rating are required",
      });
    }

    // Images
    const images = req.files?.map(
     
              (file) => `${process.env.BASE_URL}/review/${cakeName.toLowerCase().replace(/\s+/g, "_")}/${file.filename}`

    );

    if (!images || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    // 1️⃣ Save Review
    await Review.create({
      productId,
      userId,
      description,
      rating,
      images,
    });

    // 2️⃣ Get all approved reviews of this product
    const reviews = await Review.find({
      productId,
      isApproved: true,
    });

    // 3️⃣ Calculate average rating
    const totalRating = reviews.reduce(
      (sum, r) => sum + r.rating,
      0
    );

    const averageRating =
      reviews.length > 0
        ? totalRating / reviews.length
        : 0;

    // 4️⃣ Update product rating & review count
    await Product.findByIdAndUpdate(productId, {
      averageRating: averageRating.toFixed(1),
      totalReviews: reviews.length,
    });

    res.status(201).json({
      success: true,
      message: "Review added & product rating updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({
      productId,
      isApproved: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

