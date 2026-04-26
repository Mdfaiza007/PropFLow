import express from "express";
import {
  getPayments,
  createOrder,
  verifyPayment,
  getStats,
  markPaidManual,
} from "../controllers/payment.controller.js";

const router = express.Router();

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

router.get("/", protect, getPayments);
router.post("/create-order", protect, createOrder);
router.post("/verify-payment", protect, verifyPayment);
router.get("/stats", protect, authorizeRoles("owner"), getStats);
router.put("/:id/manual", protect, authorizeRoles("owner", "manager"), markPaidManual);

export default router;;
