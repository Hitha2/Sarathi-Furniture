import express from "express";
import { globalSearch } from "../controllers/searchController.js";

const router = express.Router();

// IMPORTANT: this is correct with app.use("/api/search")
router.get("/", globalSearch);

export default router;