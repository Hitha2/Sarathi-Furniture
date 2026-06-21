import User from "../models/User.js";
import Order from "../models/Order.js";

const calculateFinalItemAmount = (order, item) => {
  const subtotal = (item.price || 0) * (item.quantity || 0);
  const gst = subtotal * 0.18;
  return subtotal + gst;
};

// ✅ GET ALL USERS WITH ORDER DETAILS
export const getAllAccounts = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const usersWithOrders = await Promise.all(
      users.map(async (user) => {

        const orders = await Order.find({ userId: user._id });

        let totalSpent = 0;
        let totalOrders = 0;

        orders.forEach((order) => {

          let orderTotal = 0;

          order.items.forEach((item) => {

            if (item.status?.toLowerCase() === "cancelled") return;

            totalOrders += item.quantity || 0;

            const subtotal = (item.price || 0) * (item.quantity || 0);
            const gst = subtotal * 0.18;

            const isOnline = order.paymentMethod?.toLowerCase() !== "cod";
            const isCODDelivered =
              order.paymentMethod?.toLowerCase() === "cod" &&
              item.status === "Delivered";

            if (isOnline || isCODDelivered) {
              orderTotal += subtotal + gst;
            }
          });

          // ✅ SHIPPING MUST BE ADDED PER ORDER (IMPORTANT FIX)
          if (orderTotal > 0) {
            totalSpent += orderTotal + (order.shippingCharge || 0);
          }

        });

        return {
          ...user._doc,
          totalOrders,
          totalSpent: Math.round(totalSpent)
        };
      })
    );

    res.json(usersWithOrders);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE USER
export const updateAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!user)
      return res.status(404).json({
        message: "User not found",
      });

    res.json(user);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ✅ TOGGLE STATUS
export const toggleAccountStatus = async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user)
      return res.status(404).json({
        message: "User not found",
      });

    user.isActive = !user.isActive;

    await user.save();

    res.json(user);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ✅ DELETE USER
export const deleteAccount = async (req, res) => {
  try {

    await User.findByIdAndDelete(req.params.id);

    res.json({
      message: "User deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};