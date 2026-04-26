import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

import { protect } from "../middleware/auth.middleware.js";

router.use(protect);

router.route("/")
  .get(getNotifications);

router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);
router.delete("/clear", clearNotifications);

export default router;;
