import express from "express";
import {
  getRequests,
  submitRequest,
  getRequest,
  updateStatus,
  assignVendor,
  deleteRequest,
} from "../controllers/maintenance.controller.js";

const router = express.Router();

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import upload from "../middleware/upload.middleware.js";

router.route("/")
  .get(protect, getRequests)
  .post(protect, authorizeRoles("tenant"), upload.array("photos", 3), submitRequest);

router.route("/:id")
  .get(protect, getRequest)
  .delete(protect, deleteRequest);

router.put("/:id/status", protect, authorizeRoles("owner", "manager"), updateStatus);
router.put("/:id/assign", protect, authorizeRoles("owner", "manager"), assignVendor);

export default router;;
