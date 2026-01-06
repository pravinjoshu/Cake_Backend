import fs from "fs";
import path from "path";

export const updateImage = (req, res) => {
  try {
    const cakeName = req.body.cakeName.toLowerCase().replace(/ /g, "_");
    const weightFolder = (req.body.weight || "").replace(".", "_");


    const oldImage = req.body.oldImage;

    const oldPath = path.join("public/images", `${cakeName}_${weightFolder}`, oldImage);

    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }

    const newImage = req.file.filename;
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";

    console.log(baseUrl)

    res.status(200).json({
      success: true,
      message: "Image updated successfully",
      image: `${baseUrl}/public/images/${cakeName}_${weightFolder}/${newImage}`
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



export const uploadImage = (req, res) => {
  try {
    const cakeName = req.body.cakeName.toLowerCase().replace(/ /g, "_");
    const weightFolder = req.body.weight.replace(".", "_");
    const baseUrl = process.env.BASE_URL || "http://localhost:5000";
    console.log(baseUrl)

    const urls = req.files.map(file => {
      return `${baseUrl}/public/images/${cakeName}_${weightFolder}/${file.filename}`;
    });

    res.status(200).json({
      success: true,
      images: urls
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};



export const deleteImage = (req, res) => {
  try {
    const { imageName } = req.body; // img filename

    const filePath = path.join("public/images", imageName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

