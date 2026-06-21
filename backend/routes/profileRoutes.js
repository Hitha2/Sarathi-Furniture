import express from "express";
import {
  getProfile,
  updateProfile,
  addAddress,updateAddress,deleteAddress
} from "../controllers/profileController.js";

const router = express.Router();

router.get("/:id", getProfile);
router.put("/:id", updateProfile);
router.post("/address/:id", addAddress);
router.put("/:userId/address/:addressId", updateAddress);
router.delete("/:userId/address/:addressId", deleteAddress);

export default router;