import express from "express";
import {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notification.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";
const router = express.Router();
router.post("/create-notification", isAuthenticated, createNotification);
router.get(
  "/get-user-notifications/:userId",
  isAuthenticated,
  getUserNotifications
);
router.patch("/mark-as-read/:notificationId", isAuthenticated, markAsRead);
router.patch("/mark-all-as-read/:userId", isAuthenticated, markAllAsRead);
router.delete(
  "/delete-notification/:notificationId",
  isAuthenticated,
  deleteNotification
);
router.delete(
  "/clear-all-notifications/:userId",
  isAuthenticated,
  clearAllNotifications
);
export default router;
