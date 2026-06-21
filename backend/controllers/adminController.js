import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


// ================= CREATE ADMIN FIRST TIME =================
export const createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      email,
      password: hashedPassword,
    });

    await admin.save();

    res.status(201).json({ message: "Admin Created Successfully ✅" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================= ADMIN LOGIN =================
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = jwt.sign(
      { id: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Admin Login Successful ✅",
      token,
      admin: {
        _id: admin._id,
        email: admin.email
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};