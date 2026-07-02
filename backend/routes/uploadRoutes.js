import express from "express";
import upload from "../middleware/upload.js"; // fix spelling

const router = express.Router();

router.post("/", upload.single("image"), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const imageUrl = `https://sarathi-furniture.onrender.com/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;