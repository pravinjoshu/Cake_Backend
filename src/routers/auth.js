// import express from "express";
// import axios from "axios";
// import { User } from "../models/login.js";
// import jwt from "jsonwebtoken";

// const router = express.Router();

// router.post("/auth/google", async (req, res) => {
//   try {
//     const { access_token } = req.body;

//     if (!access_token) {
//       return res.status(400).json({ success: false, message: "No access token provided" });
//     }

//     // Get user info from Google
//     const googleUser = await axios.get(
//       `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
//     );

//     const { email, name, picture } = googleUser.data;

//     if (!email) {
//       return res.status(400).json({ success: false, message: "Google account has no email" });
//     }

//     // Check user exists or create new
//     let user = await User.findOne({ email });

//     if (!user) {
//       user = await User.create({
//         name,
//         email,
//         picture,
//         password: "" // Google users don't use password login
//       });
//     }

//     // Create JWT
//     const token = jwt.sign(
//       { id: user._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     return res.json({
//       success: true,
//       message: "Google login successful",
//       token,
//       user
//     });

//   } catch (error) {
//     console.error("Google Login Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Google login failed"
//     });
//   }
// });

// export default router;
