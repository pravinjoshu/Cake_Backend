import express from "express";
import { registerUser, loginUser,forgotPassword,verifyOtp,resetPassword,googleLogin } from "../controllers/loginController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/auth/google", googleLogin);

export default router;
