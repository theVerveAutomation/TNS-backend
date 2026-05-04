// src/routes/auth.routes.js
const express = require("express");
const {
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
  refreshToken,
} = require("../controllers/auth.controller.js");
const { protect } = require("../middleware/auth.middleware.js");
const { adminOnly } = require("../middleware/adminOnly.middleware.js");

const router = express.Router();

// ── Public routes ─────────────────────────────────────────────────────────────
router.post("/register", register);
router.post("/login", login);                  
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/get-reset-link", getResetLink);
router.post("/refresh", refreshToken);        

// ── Auth + change password ────────────────────────────────────────────────────
router.post("/change-password", protect, changePassword);

// ── Admin-only: password reset request management ─────────────────────────────
router.get("/reset-requests", protect, adminOnly, getResetRequests);
router.post("/reset-requests/:id/approve", protect, adminOnly, approveResetRequest);
router.post("/reset-requests/:id/reject", protect, adminOnly, rejectResetRequest);

module.exports = router;