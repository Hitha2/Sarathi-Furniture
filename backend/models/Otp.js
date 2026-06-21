import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email:
  { type: String,
     required: true 
  },
  otp: 
  { type: String, 
    required: true 
  },
  expires: 
  { type: Date, 
    required: true 
  },
});

export default mongoose.model("Otp", otpSchema);