import express from "express";

import {
  getDashboardSummary,
  getSalesData,
  getOrderStatus,
  getRecentOrders,
  getStock,

} from "../controllers/dashboardController.js";

const router = express.Router();

/* DASHBOARD ROUTES */
router.get("/summary", getDashboardSummary);
router.get("/sales", getSalesData);
router.get("/order-status", getOrderStatus);
router.get("/recent-orders", getRecentOrders);
router.get("/stock", getStock);        // ✅ IMPORTANT FIX
// router.get("/top-products", getTopProducts);

export default router;