import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/notifications", getNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/:id/read", markAsRead);

export default router;
