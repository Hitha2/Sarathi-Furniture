import Product from "../models/Product.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Inventory from "../models/Inventory.js";


const getDateFilter = (filter) => {
  const now = new Date();

  let startDate;

  if (filter === "daily") {
    startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
  }

  else if (filter === "weekly") {
    startDate = new Date();
    startDate.setDate(now.getDate() - 7);
  }

  else if (filter === "monthly") {
    startDate = new Date();
    startDate.setMonth(now.getMonth() - 1);
  }

  return startDate;
};
const calculateFinalItemAmount = (order, item) => {
  const subtotal = (item.price || 0) * (item.quantity || 0);
  const gst = subtotal * 0.18;
  return subtotal + gst;
};

/* ===== SUMMARY ===== */
export const getDashboardSummary = async (req, res) => {
  const { filter } = req.query;

  const startDate = getDateFilter(filter);
  try {

    const totalProducts = await Product.countDocuments();

    const totalUsers = await User.countDocuments();

    // ✅ TOTAL PURCHASED PRODUCTS COUNT
    const orders = await Order.find({ createdAt: { $gte: startDate } });

    const totalOrders = orders.reduce((total, order) => {

      const itemCount = (order.items || []).reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );

      return total + itemCount;

    }, 0);

    // ✅ DELIVERED REVENUE ONLY
    let revenue = 0;

orders.forEach((order) => {

  let orderTotal = 0;

  order.items.forEach((item) => {

    if (item.status?.toLowerCase() === "cancelled") return;

    const isOnline = order.paymentMethod?.toLowerCase() !== "cod";

    const isCODDelivered =
      order.paymentMethod?.toLowerCase() === "cod" &&
      item.status === "Delivered";

    if (isOnline || isCODDelivered) {
      orderTotal += calculateFinalItemAmount(order, item);
    }
  });

  if (orderTotal > 0) {
    revenue += Math.round(orderTotal + (order.shippingCharge || 0));
  }
});

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      revenue,
    });

  } catch (err) {
    res.status(500).json(err);
  }
};
/* ===== SALES DATA ===== */
/* ===== SALES DATA ===== */
export const getSalesData = async (req, res) => {
  const { filter } = req.query;

  const startDate = getDateFilter(filter);

  try {
    const orders = await Order.find({ createdAt: { $gte: startDate } });

    const salesMap = {};

    orders.forEach((order) => {
      const day = new Date(order.createdAt).getDay();

      let orderTotal = 0;

      order.items.forEach((item) => {

        const isOnline = order.paymentMethod === "online";

        const isCODDelivered =
          order.paymentMethod === "cod" &&
          item.status === "Delivered";

        if (isOnline || isCODDelivered) {

          const subtotal = (item.price || 0) * (item.quantity || 0);
          const gst = subtotal * 0.18;

          orderTotal += subtotal + gst;
        }

      });

      // ✅ ADD SHIPPING ONCE PER ORDER
      if (orderTotal > 0) {
        if (!salesMap[day]) salesMap[day] = 0;

        salesMap[day] += orderTotal + (order.shippingCharge || 0);
      }
    });

    const sales = Object.keys(salesMap).map((day) => ({
      _id: Number(day) + 1,
      sales: Math.round(salesMap[day]),
    }));

    res.json(sales);

  } catch (err) {
    res.status(500).json(err);
  }
};

/* ===== ORDER STATUS ===== */
export const getOrderStatus = async (req, res) => {
  const { filter } = req.query;

  const startDate = getDateFilter(filter);
  try {

    const orders = await Order.find({ createdAt: { $gte: startDate } });

    const statusCount = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {

        if (!statusCount[item.status]) {
          statusCount[item.status] = 0;
        }

        statusCount[item.status]++;
      });
    });

    const data = Object.keys(statusCount).map((key) => ({
      _id: key,
      value: statusCount[key],
    }));

    res.json(data);

  } catch (err) {
    res.status(500).json(err);
  }
};

/* ===== RECENT ORDERS ===== */
export const getRecentOrders = async (req, res) => {
  const { filter } = req.query;

  const startDate = getDateFilter(filter);
  try {

    const orders = await Order.find({ createdAt: { $gte: startDate } })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    // ✅ REMOVE CANCELLED PRODUCT AMOUNTS
    const formattedOrders = orders.map((order) => {

      const totalAmount = (order.items || []).reduce(
        (sum, item) => {

          if (item.status !== "Cancelled") {
            return sum + calculateFinalItemAmount(order, item);
          }

          return sum;

        },
        0
      );

      return {
        ...order._doc,
        totalAmount,
      };
    });

    res.json(formattedOrders);

  } catch (err) {
    res.status(500).json(err);
  }
};

export const getStock = async (req, res) => {
  try {
    const stock = await Inventory.find()
      .populate({
        path: "productId",
        populate: [
          { path: "categoryId", select: "name" },
          { path: "subcategoryId", select: "name" }
        ]
      });

    const formatted = stock.map(item => ({
      productId: item.productId?._id,   // ✅ REQUIRED FOR HIGHLIGHT
      name: item.productId?.subcategoryId?.name || "Unknown Subcategory",
      category: item.productId?.categoryId?.name || "Unknown Category",
      stock: item.stock
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};