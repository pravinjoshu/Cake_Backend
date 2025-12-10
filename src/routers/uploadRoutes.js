import express from "express";
import upload from "../middleware/upload.js";
import { uploadImage } from "../controllers/uploadController.js";



const router = express.Router();

router.post(
  "/upload-images",
  upload.array("images", 10),
  uploadImage
);


export default router;
