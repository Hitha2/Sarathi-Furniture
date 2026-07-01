import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Order from "../models/Order.js";

// ✅ 1. Create Razorpay Order
export const createOrder = async (req, res) => {
  try {
    let { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount required" });
    }

    amount = Math.round(amount); // ensure integer

    const options = {
      amount, // already in paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Order creation failed" });
  }
};

// ✅ 2. Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Signature mismatch",
      });
    }

    return res.json({
      success: true,
      message: "Payment verified successfully",
    });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
// ✅ 3. COD Order
export const codOrder = async (req, res) => {
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
    } = req.body;

    const order = await Order.create({
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
      status: "COD",
    });

    res.json({
      success: true,
      message: "COD Order placed",
      order,
    });

  } catch (err) {
    console.error("COD ERROR:", err);
    res.status(500).json({ message: "COD failed" });
  }
};