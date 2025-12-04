// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Header la token illa-na
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Authorization denied.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Same secret key use pannunga (login time la use panradhe)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "SECRET_KEY");

    // User data va next middleware/controller ku pass panna
    req.user = decoded;

    next(); // Next step → controller
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

