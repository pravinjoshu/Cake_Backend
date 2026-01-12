import express from "express";
import upload from "../middleware/reviewupload.js";
import { addReview,getAllReviews,getProductReviews } from "../controllers/reviewController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/review",verifyToken,upload.array("images", 5),addReview);
router.get("/review", getAllReviews);
router.get("/reviews/:productId", getProductReviews);


export default router;
