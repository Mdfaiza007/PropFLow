import express from "express";
import {
  getProperties,
  createProperty,
  getProperty,
  updateProperty,
  deleteProperty,
  uploadPhotos,
  deletePhoto,
} from "../controllers/property.controller.js";

const router = express.Router();

import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import upload from "../middleware/upload.middleware.js";

router.route("/")
  .get(protect, getProperties)
  .post(protect, authorizeRoles("owner"), createProperty);

router.route("/:id")
  .get(protect, getProperty)
  .put(protect, authorizeRoles("owner"), updateProperty)
  .delete(protect, authorizeRoles("owner"), deleteProperty);

router.route("/:id/photos")
  .post(protect, authorizeRoles("owner"), upload.array("photos", 5), uploadPhotos)
  .delete(protect, authorizeRoles("owner"), deletePhoto);

export default router;
