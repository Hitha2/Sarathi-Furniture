// routes/wishlistRoutes.js
import express from "express";
import {
  getWishlist,
  toggleWishlist,
  removeFromWishlist
} from "../controllers/wishlistController.js";

import { verifyUser } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyUser, getWishlist);
router.post("/", verifyUser, toggleWishlist);
router.delete("/:productId", verifyUser, removeFromWishlist);

export default router;