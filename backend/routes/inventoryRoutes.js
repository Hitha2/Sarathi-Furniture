import express from "express";
import {
  getInventory,
  updateInventory,deleteInventory
} from "../controllers/inventoryController.js";

const router = express.Router();

router.get("/", getInventory);
router.put("/:id", updateInventory);
router.delete("/:id", deleteInventory);

export default router;