export const uploadImage = (req, res) => {
  try {
    const urls = req.files.map(file => {
      return `${process.env.BASE_URL}/images/${file.filename}`;
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
