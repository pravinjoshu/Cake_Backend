import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  acceptNotification,
  rejectNotification
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/notifications", getNotifications);
router.get("/notifications/unread-count", getUnreadCount);
router.patch("/notifications/mark-read", markAllAsRead);
router.put("/notifications/:id/read", markAsRead);
router.put("/notifications/:notificationId/accept", acceptNotification);
router.put("/notifications/:notificationId/reject", rejectNotification);


export default router;
