import { Review } from "../models/review.js";

export const addReview = async (req, res) => {
  try {
    const { cakeName, description, rating } = req.body;

    const images = req.files?.map(
      (file) => `${process.env.BASE_URL}/review/${cakeName.toLowerCase().replace(/\s+/g, "_")}/${file.filename}`
    );

    if (!cakeName || !description || !rating || !images || images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cake name, description, rating and image are required",
      });
    }

    const review = await Review.create({
      cakeName,
      description,
      rating,
      images,
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
