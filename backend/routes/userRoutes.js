import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyOtpOnly
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/verify-otp", verifyOtpOnly);

export default router;