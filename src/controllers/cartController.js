import { Cart } from "../models/cart.js";
import Product from "../models/product.js";



// ✅ GET CART
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        select: "cakeName images price",
      });

    if (!cart) {
      return res.json({
        success: true,
        cart: { items: [] },
      });
    }

    res.json({
      success: true,
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity, weight,price, addons } = req.body;

    if (!productId || !weight) {
      return res.status(400).json({
        success: false,
        message: "Product and weight are required",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [
          {
            product: productId,
            quantity,
            weight,
            price,
            addons: addons || [], // ⭐
          },
        ],
      });

      return res.json({ success: true, message: "Added to cart", cart });
    }

    // Same product + same weight check
    const itemExists = cart.items.find(
      (item) =>
        item.product.toString() === productId &&
        item.weight === weight
    );

    if (itemExists) {
      return res.json({
        success: false,
        message: "Item already exists in cart",
        cart,
      });
    }

    // New item (different weight OR new)
    cart.items.push({
      product: productId,
      quantity,
      weight,
      price,
      addons: addons || [], // ⭐
    });

    await cart.save();

    res.json({ success: true, message: "Added to cart", cart });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



 
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
 

    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const itemExists = cart.items.some(
      (item) => item._id.toString() === itemId
    );

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // ⭐ remove by item _id
    cart.items = cart.items.filter(
      (item) => item._id.toString() !== itemId
    );

    await cart.save();

    res.json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


