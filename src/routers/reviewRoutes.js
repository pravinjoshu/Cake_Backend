import express from "express";
import { addReview } from "../controllers/reviewController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/review", verifyToken, addReview);

export default router;
