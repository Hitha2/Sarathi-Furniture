import mongoose from "mongoose";

const blacklistedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "1d" } // auto delete after 1 day
});

export default mongoose.model("BlacklistedToken", blacklistedTokenSchema);