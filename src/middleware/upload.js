import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let cakeName = req.body.cakeName || "unknown";

    // convert to safe folder name
    cakeName = cakeName.toLowerCase().replace(/ /g, "_");

    const folderPath = `public/images/${cakeName}`;

    // If folder does NOT exist → create it
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    cb(null, folderPath);
  },

  filename: (req, file, cb) => {
  let cakeName = req.body.cakeName || "cake";

  cakeName = cakeName.toLowerCase().replace(/ /g, "_");

  if (!req.imageCount) req.imageCount = 0;
  req.imageCount++;

  const ext = path.extname(file.originalname);
  const fileName = `${cakeName}_image_${req.imageCount}${ext}`;

  cb(null, fileName);
}

});

const upload = multer({ storage });

export default upload;
