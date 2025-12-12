import express from "express";
import upload from "../middleware/upload.js";
import { 
  uploadImage,
  updateImage,
  deleteImage
} from "../controllers/uploadController.js";

const router = express.Router();

// POST → upload multiple images
router.post(
  "/upload-images",
  upload.array("images", 10),
  uploadImage
);

// PUT → update single image
router.put(
  "/update-image",
  upload.single("image"),   // multer will read body fields too!
  updateImage
);

// DELETE → delete image
router.delete(
  "/delete-image",
  deleteImage
);

export default router;
