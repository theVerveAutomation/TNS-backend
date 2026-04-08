// src/routes/auth.routes.js
import express from "express";
import {
  register,
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  getResetRequests,
  approveResetRequest,
  rejectResetRequest,
  getResetLink,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js"; // ← fixed: was "authMiddleware"
import { adminOnly } from "../middleware/adminOnly.middleware.js";

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/get-reset-link", getResetLink);

// ── Auth + change password ────────────────────────────────────────────────────
router.post("/change-password", protect, changePassword); // ← updated

// ── Admin-only: password reset request management ─────────────────────────────
router.get("/reset-requests", protect, adminOnly, getResetRequests); // ← updated
router.post("/reset-requests/:id/approve", protect, adminOnly, approveResetRequest); // ← updated
router.post("/reset-requests/:id/reject", protect, adminOnly, rejectResetRequest); // ← updated

export default router;