import User from "../models/User.js";
import Otp from "../models/Otp.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer"; // ⚡ use nodemailer instead of sendEmail
import jwt from "jsonwebtoken";

// ⚡ Temporary in-memory OTP store
// Note: Only for development. Restarting server clears OTPs.
const otpStore = {};

/* REGISTER */
export const registerUser = async (req, res) => {
  try {
    let { name, email, password, phone, address } = req.body;

    name = name?.trim();
    email = email?.trim().toLowerCase();
    phone = phone?.trim();
    address = address?.trim();

    if (!/^[A-Za-z ]{3,}$/.test(name)) {
      return res.status(400).json({ message: "Invalid name" });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (!/^(?=.*[A-Z])(?=.*\d).{6,}$/.test(password)) {
      return res.status(400).json({
        message: "Password must contain minimum 6 characters, one capital letter and one number"
      });
    }

    if (!/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: "Phone must be 10 digits" });
    }

    if (!address || address.length < 5) {
      return res.status(400).json({ message: "Invalid address" });
    }

    const existingUser = await User.findOne({
      $or: [
        { email },
        { phone }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email or Phone already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
    });

    await user.save();

    res.status(201).json({ message: "User Registered Successfully ✅" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { login, password } = req.body;

    
    // ✅ find user by email OR phone
    const user = await User.findOne({
      $or: [
        { email: login.toLowerCase() },
        { phone: login }
      ]
    });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password" });

    // ✅ CREATE TOKEN (this is REQUIRED)
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,   // 🔥 use .env key (NOT hardcoded)
      { expiresIn: "1d" }
    );

    // ✅ SEND TOKEN TO FRONTEND
    res.status(200).json({
      message: "Login Successful ✅",
      token,   // 👈 IMPORTANT (frontend needs this)
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* FORGOT PASSWORD */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    // Save OTP in DB (replace old OTP if exists)
    await Otp.findOneAndUpdate(
      { email },
      { otp, expires },
      { upsert: true, returnDocument:"after" }
    );

    console.log(`Generated OTP for ${email}:`, otp); // for debugging

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Password Reset OTP",
      text: `Your 6-digit OTP is: ${otp}. It expires in 5 minutes.`,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
};

/* RESET PASSWORD */
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    // Find OTP in DB
    const record = await Otp.findOne({ email });
    if (!record) return res.status(400).json({ message: "No OTP found for this email" });
    if (Date.now() > record.expires) return res.status(400).json({ message: "OTP expired" });
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    // OTP is valid → reset password
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Delete OTP after successful reset
    await Otp.deleteOne({ email });

    res.json({ message: "Password reset successful ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
};

// userController.js
export const verifyOtpOnly = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await Otp.findOne({ email });
    if (!record) return res.status(400).json({ message: "No OTP found for this email" });
    if (Date.now() > record.expires) return res.status(400).json({ message: "OTP expired" });
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    res.json({ message: "OTP verified ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error ❌" });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(400).json({ message: "No token found" });
    }

    const token = authHeader.split(" ")[1];

    await BlacklistedToken.create({ token });

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
