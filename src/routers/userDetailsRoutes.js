import express from "express";
import { getUserDetails, saveUserDetails } from "../controllers/userDetailsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user details - Protected route
router.get("/details/:userId", verifyToken, getUserDetails);

// Save user details - Protected route
router.post("/details", verifyToken, saveUserDetails);

export default router;