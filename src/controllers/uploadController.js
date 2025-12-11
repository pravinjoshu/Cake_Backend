export const uploadImage = (req, res) => {
  try {
    const urls = req.files.map(file => {
      return ` ${file.filename}`;
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
