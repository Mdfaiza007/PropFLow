import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  uploadAvatar,
  forgotPassword,
  resetPassword,
  getTenantsList,
  getManagersList,
} from "../controllers/auth.controller.js";

const router = express.Router();

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import upload from "../middleware/upload.middleware.js";

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", protect, getMe);
router.get("/tenants", protect, authorizeRoles("owner", "manager"), getTenantsList);
router.get("/managers", protect, authorizeRoles("owner"), getManagersList);
router.put("/update-profile", protect, updateProfile);
router.post("/upload-avatar", protect, upload.single("avatar"), uploadAvatar);

export default router;
