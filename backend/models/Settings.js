import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  shippingRatePerKm: {
    type: Number,
    default: 5,
  },
});

export default mongoose.model(
  "Settings",
  settingsSchema
);