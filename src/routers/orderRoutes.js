import express from "express";
import { placeOrder, getUserOrders,updateOrderStatus } from "../controllers/orderController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Place order - Protected route
router.post("/orders", verifyToken, placeOrder);

// Get user orders - Protected route (optional)
router.get("/user/:userId", verifyToken, getUserOrders);

router.patch("/orders/:id/status", updateOrderStatus);


export default router;