import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let cakeName = req.body.cakeName || "unknown";

    // ✅ safe folder name
    cakeName = cakeName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    const folderPath = `public/review/${cakeName}`;

    // ✅ create folder if not exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    cb(null, folderPath);
  },

  filename: (req, file, cb) => {
    let cakeName = req.body.cakeName || "cake";

    cakeName = cakeName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    // image counter
    if (!req.imageCount) req.imageCount = 0;
    req.imageCount++;

    const ext = path.extname(file.originalname);
    const fileName = `${cakeName}_image_${req.imageCount}${ext}`;

    cb(null, fileName);
  },
});

const upload = multer({ storage });

export default upload;
