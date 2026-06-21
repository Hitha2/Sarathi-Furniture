import express from "express";
import {
  getNotifications,
  markAllAsRead,clearNotifications
} from "../controllers/notificationController.js";

const router = express.Router();

// GET notifications
router.get("/", getNotifications);

// MARK ALL AS READ
router.put("/mark-read", markAllAsRead);

router.delete("/clear", clearNotifications);
export default router;