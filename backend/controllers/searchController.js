import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const globalSearch = async (req, res) => {
  try {
    let q = req.query.q;

    if (!q || !q.trim()) {
      return res.json({
        products: [],
        orders: [],
        customers: []
      });
    }

    q = q.trim();

    const safeQ = q;

    const products = await Product.find({
      name: { $regex: safeQ, $options: "i" }
    });

    const customers = await User.find({
      name: { $regex: safeQ, $options: "i" }
    });

    let orders = [];

    if (mongoose.Types.ObjectId.isValid(q)) {
      orders = await Order.find({ _id: q });
    } else {
      orders = [];
    }

    res.json({
      products,
      orders,
      customers
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Search failed" });
  }
};