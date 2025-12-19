import express from "express";
import upload from "../middleware/reviewupload.js";
import { addReview,getAllReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/review", upload.array("images", 5), addReview);
router.get("/review", getAllReviews);

export default router;
