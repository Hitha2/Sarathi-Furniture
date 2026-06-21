import express from "express";
import { createAdmin, adminLogin } from "../controllers/adminController.js";

const router = express.Router();

router.post("/create-admin", createAdmin);   // one time only
router.post("/login", adminLogin);

export default router;