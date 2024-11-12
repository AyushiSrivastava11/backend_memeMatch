import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

// Create a new notification
export const createNotification = async (req, res) => {
  try {
    const { userId, type, content, relatedUser } = req.body;

    if (!userId || !type || !content) {
      return res.status(400).json({ message: "User ID, type, and content are required" });
    }

    const notification = await Notification.create({
      user: userId,
      type,
      content,
      relatedUser,
    });

    res.status(201).json({ success: true, notification, message: "Notification created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all notifications for a specific user
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;

    const notifications = await Notification.find({ user: userId })
      .populate("relatedUser", "username avatar")
      .sort({ createdAt: -1 }); // Sorting notifications by most recent

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark a single notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, notification, message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications for a user as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.params.userId;

    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });

    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    await notification.deleteOne();
    res.status(200).json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear all notifications for a user
export const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;

    await Notification.deleteMany({ user: userId });

    res.status(200).json({ success: true, message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
