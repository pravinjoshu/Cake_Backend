import express from "express";
import { getUserDetails, saveUserDetails,getAllUserDetails   } from "../controllers/userDetailsController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();
// 🔹 ALL customers
router.get("/details", verifyToken, getAllUserDetails);


// Get user details - Protected route
router.get("/details/:userId", verifyToken, getUserDetails);

// Save user details - Protected route
router.post("/details", verifyToken, saveUserDetails);

export default router;