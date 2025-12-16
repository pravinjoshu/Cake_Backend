import { Notification } from "../models/notification.js";
import { Order } from "../models/order.js";

export const getNotifications = async (req, res) => {
  try {
     

    const notifications = await Notification
      .find()
      .populate("orderId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ isRead: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      isRead: true,
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptNotification = async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    return res.status(404).json({ message: "Not found" });
  }

  notification.isAccepted = true;
  notification.isRejected = false;
  notification.isRead = true;
  await notification.save();

  res.json({ success: true });
};

export const rejectNotification = async (req, res) => {
  const { notificationId } = req.params;

  const notification = await Notification.findById(notificationId);

  notification.isRejected = true;
  notification.isAccepted = false;
  notification.isRead = true;
  await notification.save();

  // optional
  await Order.findByIdAndUpdate(notification.orderId, {
    status: "cancelled",
  });

  res.json({ success: true });
};



