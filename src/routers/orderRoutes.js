import express from "express";
import {
    placeOrder,
    getUserOrders,
    updateOrderStatus,
    getAllOrders,
    deleteOrderById
} from "../controllers/orderController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Place order - Protected route
router.post("/orders", verifyToken, placeOrder);

// Get user orders - Protected route (optional)
router.get("/user/:userId", verifyToken, getUserOrders);

// Get all orders (Admin)
router.get("/orders", getAllOrders);

// Update order status
router.patch("/orders/:id/status", updateOrderStatus);

// Delete order
router.delete("/orders/:id", deleteOrderById);


export default router;