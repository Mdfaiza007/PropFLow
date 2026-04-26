import express from "express";
import {
  getTenants,
  addTenant,
  getTenant,
  updateTenant,
  deleteTenant,
} from "../controllers/tenant.controller.js";

const router = express.Router();

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

router.route("/")
  .get(protect, authorizeRoles("owner", "manager"), getTenants)
  .post(protect, authorizeRoles("owner"), addTenant);

router.route("/:id")
  .get(protect, getTenant)
  .put(protect, updateTenant)
  .delete(protect, authorizeRoles("owner"), deleteTenant);

export default router;
