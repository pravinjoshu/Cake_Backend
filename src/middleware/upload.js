import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
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
