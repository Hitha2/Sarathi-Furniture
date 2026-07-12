import express from "express";
import passport from "../config/passport.js";
import { logoutUser } from "../controllers/authController.js";
import { verifyUser } from "../middleware/auth.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// ================= GOOGLE LOGIN START =================
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// ================= GOOGLE CALLBACK =================


router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const userId = encodeURIComponent(req.user._id.toString());
    const name = encodeURIComponent(req.user.name || "");
    const email = encodeURIComponent(req.user.email || "");

    res.redirect(
      `https://sarathi-furniture.vercel.app/login-success?token=${token}&userId=${userId}&name=${name}&email=${email}`
    );
  }
);

// ================= LOGOUT =================
router.post("/logout", verifyUser, logoutUser);

export default router;