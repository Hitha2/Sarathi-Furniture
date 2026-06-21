// controllers/wishlistController.js
import Wishlist from "../models/Wishlist.js";
import mongoose from "mongoose";

/* GET wishlist */
export const getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.find({ userId: req.userId })
      .populate({
        path: "productId",
        populate: {
          path: "subcategoryId"
        }
      });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* TOGGLE wishlist (Flipkart style) */
export const toggleWishlist = async (req, res) => {
  try {
    const userId = req.userId;
    const productId = req.body?.productId;

    if (!productId) {
      return res.status(400).json({ message: "productId required" });
    }

    const existing = await Wishlist.findOne({ userId, productId });

    if (existing) {
      await Wishlist.deleteOne({ userId, productId });
      return res.json({ liked: false, message: "Removed from wishlist" });
    }

    await Wishlist.create({ userId, productId });

    res.status(201).json({ liked: true, message: "Added to wishlist" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* REMOVE */
export const removeFromWishlist = async (req, res) => {
  try {
    await Wishlist.deleteOne({
      userId: req.userId,
      productId: req.params.productId,
    });

    res.json({ message: "Removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};