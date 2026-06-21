import jwt from "jsonwebtoken";
import BlacklistedToken from "../models/BlacklistedToken.js";

export const googleSuccess = async (req, res) => {
  try {
    const user = req.user;

    const token = jwt.sign(
      { id: user._id },
      "mysecretkey",
      { expiresIn: "7d" }
    );

    const redirectUrl = `http://localhost:5173/login-success?token=${token}&userId=${user._id}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`;

    res.redirect(redirectUrl);

  } catch (err) {
    res.redirect("http://localhost:5173/login");
  }
};

export const googleFailure = (req, res) => {
  res.send("Google Login Failed");
};

export const logoutUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      const exists = await BlacklistedToken.findOne({ token });

      if (!exists) {
        await BlacklistedToken.create({ token });
      }
    }

    req.logout(function(err) {
      if (err) {
        return res.status(500).json({ message: "Logout error" });
      }

      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        return res.json({ message: "Logged out successfully" });
      });
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};