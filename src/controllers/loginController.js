import { User } from "../models/login.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import { sendOTP } from "../utils/mail.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check existing user
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,   // <-- ENV use pannunga
  { expiresIn: "7d" }
);

    console.log(token)
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({
        success: false,
        message: "No access token provided"
      });
    }

    // Get user info from Google
    const googleUser = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
    );

    const { email, name, picture } = googleUser.data;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Google account has no email"
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    // Create new user if not exists
    if (!user) {
      user = await User.create({
        name,
        email,
        picture,
        password: null,
        loginType: "GOOGLE",
      });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Google login successful",
      token,
      user,
    });

  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Google login failed"
    });
  }
};


// TEMP OTP STORAGE


let otpStore = {};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found"
      });
    }

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store OTP temporarily
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000
    };

    // **Actual email send**
    await sendOTP(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      email
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// let otpStore = {};  

// export const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "Email not found"
//       });
//     }

//     // Generate 4-digit OTP
//     const otp = Math.floor(1000 + Math.random() * 9000).toString();

//     // OTP expiry → 5 minutes
//     otpStore[email] = {
//       otp,
//       expiresAt: Date.now() + 5 * 60 * 1000
//     };

//     // ⚠️ NOTE: Real project-la nodemailer use pannu  
//     console.log("Your OTP:", otp);

//     res.status(200).json({
//       success: true,
//       message: "OTP sent successfully",
//       email
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!otpStore[email]) {
      return res.status(400).json({
        success: false,
        message: "OTP not requested or expired"
      });
    }

    const correctOtp = otpStore[email].otp;
    const expiresAt = otpStore[email].expiresAt;

    if (Date.now() > expiresAt) {
      delete otpStore[email];
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    if (otp !== correctOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    // OTP verified — allow reset
    res.status(200).json({
      success: true,
      message: "OTP verified successfully"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    user.password = hashed;
    await user.save();

    // OTP delete after success
    delete otpStore[email];

    res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



