import express from 'express';
import upload from '../middleware/bannerupload.js'
import {addBanner,getBanners,deleteBanner}  from "../controllers/bannerController.js"

const router = express.Router();

router.post("/banner", upload.single("image"), addBanner);
router.get("/banner", getBanners);          // ✅ GET
router.delete("/banner/:id", deleteBanner)

export default router;

