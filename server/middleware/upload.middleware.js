import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = "propflow/general";
    if (file.fieldname === "photos") {
      folder = "propflow/properties";
    } else if (file.fieldname === "avatar") {
      folder = "propflow/avatars";
    } else if (file.fieldname === "document") {
      folder = "propflow/documents";
    }
    return {
      folder: folder,
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
      resource_type: "auto",
    };
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, JPEG, PNG, WEBP and PDF are allowed."), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

export default upload;;
