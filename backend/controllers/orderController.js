import Order from "../models/Order.js";
import Inventory from "../models/Inventory.js";
import { createNotification } from "./notificationController.js";

/* ================= PLACE ORDER ================= */
export const placeOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      subtotal,
      productSavings,
      shippingCharge,
      gstPercent,
      gstAmount,
      totalSavings,
      totalAmount,
      deliveryAddress,
      paymentMethod 
    } = req.body;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    console.log("ORDER INPUT:", {
  subtotal,
  productSavings,
  shippingCharge,
  gstAmount,
  totalAmount
});
    const orderItems = [];

    // ✅ CHECK LIVE INVENTORY
    for (const item of items) {
      const productId = item._id || item.productId;

      const inventory = await Inventory.findOne({ productId }).populate("productId");

      if (!inventory) {
        return res.status(404).json({
          message: `${item.name} inventory not found`,
        });
      }

      if (item.quantity > inventory.stock) {
        return res.status(400).json({
          message: `${inventory.productId?.name || item.name} only ${inventory.stock} left`,
        });
      }

     orderItems.push({
      productId,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      status: "Pending",
    });
    }

    // ✅ REDUCE STOCK
    // ✅ REDUCE STOCK (SAFE - ATOMIC)
for (const item of orderItems) {
  const updatedInventory = await Inventory.findOneAndUpdate(
    {
      productId: item.productId,
      stock: { $gte: item.quantity }, // ✅ check + update together
    },
    {
      $inc: { stock: -item.quantity },
    },
    { new: true }
  ).populate("productId");

  // ❗ if stock not enough
  if (!updatedInventory) {
    return res.status(400).json({
      message: `${item.name} is out of stock`,
    });
  }

  // ✅ low stock alert
  if (updatedInventory.stock <= 5) {
    await createNotification(
      "stock",
      `Low stock alert: ${updatedInventory.productId?.name || item.name}`
    );
  }
}

    const order = new Order({
      userId,
      items: orderItems,
      subtotal,
      productSavings,
      shippingCharge,
      gstPercent,
      gstAmount,
      totalSavings,
      totalAmount,
      deliveryAddress,
      paymentMethod,
      
    });

    await order.save();

    await createNotification(
      "order",
      `New order placed #${order._id}`
    );

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/* ================= USER ORDERS ================= */
export const getOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .populate("items.productId");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= CANCEL ORDER ================= */
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // ✅ Check if any item already shipped/delivered
    const blocked = order.items.some(
      (item) =>
        item.status === "Shipped" ||
        item.status === "Delivered"
    );

    if (blocked) {
      return res.status(400).json({
        message: "Some items already shipped",
      });
    }

    // ✅ Restore stock
    for (const item of order.items) {
      await Inventory.findOneAndUpdate(
        { productId: item.productId },
        {
          $inc: { stock: item.quantity },
        }
      );

      // ✅ Cancel every item
      item.status = "Cancelled";
    }

    await order.save();

    await createNotification(
      "order",
      `Order cancelled by user`
    );

    res.json({
      message: "Order cancelled successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ================= SINGLE ORDER ================= */
export const getSingleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.productId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= ADMIN: ALL ORDERS ================= */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
  .populate("userId", "name email")
  .populate({
    path: "items.productId",
    populate: [
      { path: "categoryId", select: "name" },
      { path: "subcategoryId", select: "name" }
    ]
  });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= ADMIN: UPDATE STATUS ================= */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, itemIndex } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.items[itemIndex].status = status;

    await order.save();

    const updatedOrder = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate({
        path: "items.productId",
        populate: [
          { path: "categoryId", select: "name" },
          { path: "subcategoryId", select: "name" }
        ]
      });

    res.json(updatedOrder);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndUpdate(
      id,
      {
        deliveryAddress: req.body.deliveryAddress,
      },
      { new: true }
    );

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

import PDFDocument from "pdfkit";

/* ================= DOWNLOAD INVOICE ================= */
export const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice_${order._id}.pdf`
    );

    doc.pipe(res);

    // ===== HEADER =====
    doc.fontSize(20).text("Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${order._id}`);
    doc.text(`Date: ${new Date(order.createdAt).toDateString()}`);

    doc.moveDown();

    // ===== CUSTOMER =====
    doc.text("Customer Details:");
    doc.text(order.deliveryAddress?.fullName || "");
    doc.text(order.deliveryAddress?.phone || "");
    doc.text(
      `${order.deliveryAddress?.city}, ${order.deliveryAddress?.state}`
    );

    doc.moveDown();

    // ===== ITEMS =====
    doc.text("Items:", { underline: true });

    order.items.forEach((item) => {
      doc.text(
        `${item.name} (x${item.quantity}) - ₹${
          item.price * item.quantity
        }`
      );
    });

    doc.moveDown();

    // ===== BILL =====
    doc.text("Price Details:", { underline: true });

    doc.text(`Subtotal: ₹${order.subtotal}`);
    doc.text(`Discount: -₹${order.productSavings}`);
    doc.text(`Shipping: ₹${order.shippingCharge}`);
    doc.text(`GST: ₹${order.gstAmount}`);

    doc.moveDown();

    doc.fontSize(14).text(`Total: ₹${order.totalAmount}`, {
      bold: true,
    });

    doc.moveDown();

    doc.text(
      `You saved ₹${order.totalSavings || order.productSavings}`,
      { color: "green" }
    );

    doc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderReport = async (req, res) => {
  console.log("🔥 REPORT API HIT");

  try {
    const { year, month, date } = req.query;

    let filter = {};

    // ✅ DATE FILTER
    if (date) {
      const start = new Date(date);
      const end = new Date(date);

      end.setHours(23, 59, 59, 999);

      filter.createdAt = {
        $gte: start,
        $lte: end,
      };
    }

    // ✅ MONTH + YEAR
    else if (year && month) {
      const y = Number(year);
      const m = Number(month);

      filter.createdAt = {
        $gte: new Date(y, m - 1, 1),
        $lte: new Date(
          y,
          m,
          0,
          23,
          59,
          59,
          999
        ),
      };
    }

    // ✅ YEAR ONLY
    else if (year) {
      const y = Number(year);

      filter.createdAt = {
        $gte: new Date(y, 0, 1),
        $lte: new Date(
          y,
          11,
          31,
          23,
          59,
          59,
          999
        ),
      };
    }

    // ✅ FETCH ALL ORDERS
    let orders = await Order.find(filter)
      .sort({ createdAt: -1 });

    // ✅ REMOVE ONLY CANCELLED ITEMS
    orders = orders
      .map((order) => {

        const validItems = (order.items || []).filter(
          (item) =>
            item.status?.trim().toLowerCase() !==
            "cancelled"
        );

        return {
          ...order._doc,
          items: validItems,
        };
      })

      // ✅ REMOVE EMPTY ORDERS
      .filter((order) => order.items.length > 0);

    res.json(orders);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

export const addReview = async (req, res) => {
  try {

    const { productId, rating, review } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    const item = order.items.find(
      (i) =>
        String(i.productId) === String(productId)
    );

    if (!item) {
      return res.status(404).json({
        message: "Product not found in order",
      });
    }

    item.rating = rating;
    item.review = review;

    await order.save();

    res.json({
      message: "Review added",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const cancelSingleItem = async (req, res) => {
  try {
    const { orderId, productId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // 1️⃣ Mark item as cancelled
    order.items = order.items.map((item) => {
      if (String(item.productId) === String(productId)) {
        return {
          ...item,
          status: "Cancelled",
        };
      }
      return item;
    });

    // 2️⃣ Filter active items
    const activeItems = order.items.filter(
      (item) => item.status !== "Cancelled"
    );

    // 3️⃣ Recalculate subtotal
    const subtotal = activeItems.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    // 4️⃣ Recalculate savings (safe fallback)
    const productSavings = order.productSavings || 0;

    // 5️⃣ Recalculate GST
    const gstAmount = subtotal * (order.gstPercent || 18) / 100;

    // 6️⃣ Shipping stays same
    const shippingCharge = order.shippingCharge || 0;

    // 7️⃣ Final total
    const totalAmount = subtotal + gstAmount + shippingCharge;

    // 8️⃣ Update order fields
    order.subtotal = subtotal;
    order.gstAmount = gstAmount;
    order.totalAmount = totalAmount;

    await order.save();

    res.status(200).json({
      message: "Item cancelled & order recalculated successfully",
      order,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};