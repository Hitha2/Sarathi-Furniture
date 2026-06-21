import mongoose from "mongoose";

// ✅ Address Sub-Schema
const addressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  locality: {
    type: String,
    default:""
  },
  village: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  isActive: {
  type: Boolean,
  default: true
}
}, { timestamps: true });


// ✅ User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  // ✅ Google ID
  googleId: {
    type: String
  },

  // ✅ Password only required for normal login
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    }
  },

  // ✅ Phone only required for normal login
  phone: {
    type: String,
    required: function () {
      return !this.googleId;
    }
  },

  gender: {
    type: String,
    default: ""
  },

  profileImage: {
    type: String,
    default: ""
  },

  resetPasswordToken: {
    type: String
  },

  resetPasswordExpire: {
    type: Date
  },

  addresses: [addressSchema]

}, { timestamps: true });

// ✅ Model Export
const User = mongoose.model("User", userSchema);
export default User;