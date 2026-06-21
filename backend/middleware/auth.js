import jwt from "jsonwebtoken";
import BlacklistedToken from "../models/BlacklistedToken.js";

export const verifyUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Login required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 🔴 CHECK BLACKLIST FIRST
    const isBlacklisted = await BlacklistedToken.findOne({ token });

    if (isBlacklisted) {
      return res.status(401).json({ message: "Session expired. Login again." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    req.token = token;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};