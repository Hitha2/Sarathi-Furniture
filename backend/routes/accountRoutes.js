import express from "express";
import {
  getAllAccounts,
  updateAccount,
  toggleAccountStatus,
  deleteAccount
} from "../controllers/accountController.js";

const router = express.Router();

// ✅ GET ALL USERS
router.get("/accounts", getAllAccounts);

// ✅ UPDATE USER
router.put("/accounts/:id", updateAccount);

// ✅ TOGGLE ACTIVE/INACTIVE
router.put("/accounts/toggle/:id", toggleAccountStatus);

// ✅ DELETE USER
router.delete("/accounts/:id", deleteAccount);

export default router;