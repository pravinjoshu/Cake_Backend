import { Review } from "../models/review.js";

export const addReview = async (req, res) => {
  try {
    const { cakeName, description, images,rating } = req.body;

    if (!cakeName || !description || !images || !rating || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cake name, description and image are required",
      });
    }

    const review = await Review.create({
      cakeName,
      description,
      images,
      rating,
    });

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
