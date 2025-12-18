import { User } from "../models/login.js";
import Product from "../models/product.js";

// Add to Wishlist
export const addToWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (user.wishlist.includes(productId)) {
            return res.status(400).json({ success: false, message: "Product already in wishlist" });
        }

        user.wishlist.push(productId);
        await user.save();

        // Populate before sending back
        await user.populate("wishlist");

        res.status(200).json({ success: true, message: "Added to wishlist", wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Remove from Wishlist
export const removeFromWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
        await user.save();

        // Populate before sending back
        await user.populate("wishlist");

        res.status(200).json({ success: true, message: "Removed from wishlist", wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Wishlist
export const getWishlist = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).populate("wishlist");

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, wishlist: user.wishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
