import Banner from "../models/banner.js";
import fs from "fs";
import path from "path";

export const addBanner = async (req, res) => {
  try {
     const { bannerName } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const banner = new Banner({
      bannerName:bannerName,
      image: `${process.env.BASE_URL}/banner/${req.file.filename}`
    });

    await banner.save();

    res.status(201).json({
      message: "Banner added successfully",
      data: banner
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ createdAt: -1 });

    res.status(200).json({
      count: banners.length,
      data: banners
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    // image filename extract
    const filename = banner.image.split("/banner/")[1];
    const filePath = path.join("uploads/banners", filename);

    // delete image from folder
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // delete from DB
    await banner.deleteOne();

    res.status(200).json({
      message: "Banner deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
