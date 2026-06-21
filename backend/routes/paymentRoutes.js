import express from "express";
import {
  createOrder,
  verifyPayment,
  codOrder,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.post("/cod", codOrder);

export default router;