import express from "express";
import {
  placeOrder,
  getOrders,
  cancelOrder,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus,updateAddress,downloadInvoice,getOrderReport,addReview,cancelSingleItem
} from "../controllers/orderController.js";

const router = express.Router();

/* USER */
router.post("/", placeOrder);
router.get("/user/:userId", getOrders);
router.put("/:id/cancel", cancelOrder);
// router.get("/:id", getSingleOrder);

/* ADMIN */
router.get("/report", getOrderReport);
router.get("/", getAllOrders);
router.put("/:id", updateOrderStatus);
router.put("/:id/address", updateAddress);
router.get("/:id/invoice", downloadInvoice);
router.put("/:orderId/items/:productId/cancel",cancelSingleItem);

//Review route
router.put("/:id/review", addReview);
router.get("/:id", getSingleOrder);


export default router;