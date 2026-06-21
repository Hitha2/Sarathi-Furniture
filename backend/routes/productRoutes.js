// routes/productRoutes.js
import express from "express";
import upload from "../middleware/upload.js";
import {
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getSingleProduct,
} from "../controllers/productController.js";

const router = express.Router();

// Product routes with image upload
router.post("/", upload.single("image"), addProduct);
router.get("/", getProducts);
router.get("/:id", getSingleProduct);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;