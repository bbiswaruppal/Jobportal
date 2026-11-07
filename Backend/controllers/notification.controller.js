import Notification from "../models/notification.model.js";

// Get all notifications for the logged-in student
export const getNotifications = async (req, res) => {
  try {
    console.log("req._id:", req._id);
    console.log("req.user:", req.user);

    const userId = req.user?._id || req._id;
    console.log("Final User ID:", userId);
    console.log("Logged in Student ID:", userId);

    const notifications = await Notification.find({
      recipient: userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user?._id || req._id;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user?._id || req._id;

    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Delete Notification
export const deleteNotification = async (req, res) => {
  try {
    const userId = req.user?._id || req._id;
    const notificationId = req.params.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
