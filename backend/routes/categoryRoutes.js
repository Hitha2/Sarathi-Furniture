// routes/categoryRoutes.js
import express from "express";
import upload from "../middleware/upload.js";
import {
  addCategory,
  getCategories,
  deleteCategory,
  updateCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// Category routes with image upload
router.post("/", upload.single("image"), addCategory);
router.get("/", getCategories);
router.delete("/:id", deleteCategory);
router.put("/:id", upload.single("image"), updateCategory);

export default router;