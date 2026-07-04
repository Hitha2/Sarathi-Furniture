import express from "express";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post("/", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    res.json({
      imageUrl: req.file.path,
    });

  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;