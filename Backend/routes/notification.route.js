import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../controllers/notification.controller.js";
import authenticateToken from "../middleware/isAuthenticated.js";

const router = express.Router();

// Get all notifications
router.get("/", authenticateToken, getNotifications);

// Mark notification as read
router.put("/:id/read", authenticateToken, markNotificationAsRead);

// Mark all notifications as read
router.put("/read-all", authenticateToken, markAllNotificationsAsRead);

// Delete a notification
router.delete("/:id", authenticateToken, deleteNotification);



export default router;