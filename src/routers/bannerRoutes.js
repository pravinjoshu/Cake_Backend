import express from 'express';
import upload from '../middleware/bannerupload.js'
import {addBanner,getBanners,deleteBanner}  from "../controllers/bannerController.js"

const router = express.Router();

router.post("/add", upload.single("image"), addBanner);
router.get("/banner", getBanners);          // ✅ GET
router.delete("/delete/:id", deleteBanner)

export default router;

