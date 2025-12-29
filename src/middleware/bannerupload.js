import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    
    const folderPath = `public/banner/`;

    // ✅ create folder if not exists
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    cb(null, folderPath);
  },

  filename: (req, file, cb) => {
     
     
 
    // image counter
    if (!req.imageCount) req.imageCount = 0;
    req.imageCount++;

    const bannerName = req.body.bannerName
    console.log(bannerName)

    const ext = path.extname(file.originalname);
    const fileName = `${bannerName}${ext}`;

    cb(null, fileName);
  },
});

const upload = multer({ storage });

export default upload;
