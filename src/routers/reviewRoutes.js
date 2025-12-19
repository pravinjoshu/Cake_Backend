import express from "express";
import upload from "../middleware/reviewupload.js";
import { addReview } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/review", upload.array("images", 5), addReview);

export default router;
