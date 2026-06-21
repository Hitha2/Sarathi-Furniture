import Notification from "../models/Notification.js";
import { io } from "../server.js";

// GET all notifications
export const getNotifications = async (req, res) => {
  try {
    const data = await Notification.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

// CREATE notification + LIVE SOCKET EMIT
export const createNotification = async (type, message) => {
  try {
    const notif = await Notification.create({
      type,
      message,
      isRead: false,
    });

    io.emit("new_notification", notif);
  } catch (err) {
    console.log(err);
  }
};

// MARK ALL AS READ
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// CLEAR ALL NOTIFICATIONS
export const clearNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ message: "All notifications cleared" });
  } catch (err) {
    res.status(500).json(err);
  }
};