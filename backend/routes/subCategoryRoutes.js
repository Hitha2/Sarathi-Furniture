import express from "express";

import {
  addSubcategory,
  getSubcategories,
  deleteSubcategory,
  updateSubcategory, // ✅ ADD THIS
} from "../controllers/subCategoryController.js";

const router = express.Router();

// ✅ Routes
router.post("/", addSubcategory);
router.get("/:categoryId", getSubcategories);
router.delete("/:id", deleteSubcategory);


// ✅ ADD THIS (EDIT SUBCATEGORY)
router.put("/:id", updateSubcategory);

export default router;

