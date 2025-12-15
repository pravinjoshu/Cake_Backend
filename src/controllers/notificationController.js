import { Notification } from "../models/notification.js";

export const getNotifications = async (req, res) => {
  try {
    console.log("GET /notifications API HIT");

    const notifications = await Notification
      .find()
      .populate("orderId")
      .sort({ createdAt: -1 });

    console.log("Notifications:", notifications.length);

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({ isRead: false });
  res.json({ count });
};

export const markAsRead = async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, {
    isRead: true,
  });
  res.json({ success: true });
};
