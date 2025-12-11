import Product from "../models/Product.js";

// Create Product
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      message: "Product has been added successfully.",
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    const updatedProducts = products.map((p) => {
      const imagesWithUrl = p.images.map(img => {
     const cakeName = p.cakeName.toLowerCase().replace(/ /g, "_");
        return `${process.env.BASE_URL}/public/images/${cakeName}/${img.trim()}`;
      });

      return {
        ...p._doc,
        images: imagesWithUrl
      };
    });

    res.status(200).json({
      success: true,
      message: "All products fetched successfully.",
      total: updatedProducts.length,
      products: updatedProducts
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// Get One Product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Product details fetched successfully.",
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProductById = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Product details deleted successfully.",
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProductById = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // returns updated data
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Product details updated successfully.",
      product
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
