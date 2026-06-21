import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },

    name: String,
    price: Number,
    quantity: Number,
    image: String,

    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

      rating: {
      type: Number,
      default: 0,
    },

    review: {
      type: String,
      default: "",
    },
    
  },
],

    subtotal: { type: Number, default: 0 },
    productSavings: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    gstPercent: { type: Number, default: 18 },
    gstAmount: { type: Number, default: 0 },
    totalSavings: { type: Number, default: 0 },

    totalAmount: {
      type: Number,
      required: true,
    },

    deliveryAddress: {
      fullName: String,
      locality: String,
      village: String,
      city: String,
      state: String,
      pincode: String,
      phone: String,
    },
    paymentMethod: {
      type: String,
      default: "cod",
    },


    // status: {
    //   type: String,
    //   default: "Pending",
    // },
  },
  { timestamps: true }
);

// 🔥 FIX: define Order BEFORE exporting
const Order =
  mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;