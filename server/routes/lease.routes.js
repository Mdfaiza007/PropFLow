import express from "express";
import {
  getLeases,
  createLease,
  getLease,
  updateLease,
  signLease,
  deleteLease,
  uploadDocument,
} from "../controllers/lease.controller.js";

const router = express.Router();

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import upload from "../middleware/upload.middleware.js";

router.route("/")
  .get(protect, getLeases)
  .post(protect, authorizeRoles("owner", "manager"), createLease);

router.route("/:id")
  .get(protect, getLease)
  .put(protect, updateLease)
  .delete(protect, authorizeRoles("owner"), deleteLease);

router.put("/:id/sign", protect, signLease);
router.post("/:id/document", protect, authorizeRoles("owner", "manager"), upload.single("document"), uploadDocument);

export default router;
