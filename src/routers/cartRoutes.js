import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
} from "../controllers/cartController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/cart",verifyToken, addToCart);      // Add to cart
router.get("/cart",verifyToken, getCart);            // Get cart
router.delete( "/cart/:itemId",verifyToken,removeFromCart); // Delete item

export default router;
