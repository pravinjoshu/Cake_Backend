import express from "express";
import {
  placeOrder,
  getUserOrders,
  updateOrderStatus,
  getAllOrders,
  deleteOrderById,
  acceptOrder,
} from "../controllers/orderController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Place order - Protected route
router.post("/orders", verifyToken, placeOrder);

// Get user orders - Protected route
router.get("/orders/user/:userId", verifyToken, getUserOrders);

// Get all orders (Admin)
router.get("/orders", getAllOrders);

// ✅ FIXED: Changed from PATCH to PUT to match frontend
router.put("/orders/:id/status", updateOrderStatus);

// Delete order
router.delete("/orders/:id", deleteOrderById);

// Accept order
router.put("/orders/:orderId/accept", acceptOrder);

export default router;
