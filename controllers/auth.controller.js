// src/controllers/auth.controller.js
import {
  registerUser,
  loginUser,
  changePassword as changePasswordService,
} from "../services/auth.service.js";
import { User } from "../models/User.js";

import { generateToken } from "../utils/token.js";
import {
  requestPasswordReset,
  resetPasswordService,
  approvePasswordResetRequest,
  rejectPasswordResetRequest,
} from "../services/passwordReset.service.js";
import { PasswordResetRequest } from "../models/PasswordResetRequest.js";
import { logAudit } from "../utils/auditLogger.js";

// ── Register ─────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { organizationId, username, email, password, role } = req.body;
    const user = await registerUser(organizationId, username, email, password, role);
    res.status(201).json({ success: true, message: "User registered successfully", user });
  } catch (err) {
    console.error("Error:", err);
    res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal Server Error" });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { organizationId, username, password } = req.body;
    const { user, forcePasswordChange } = await loginUser(organizationId, username, password, req);
    const access_token = generateToken(user);

    await logAudit({
      userId: user.id,
      action: "LOGIN_SUCCESS",
      module: "Auth",
      entityType: "User",
      objectAffected: user.id,
      status: "Success",
      remarks: `User ${user.username} logged in`,
      req,
    }).catch(() => {}); // 

    res.json({
      success: true,
      message: "Login successful",
      forcePasswordChange,
      token: { access_token },
      user,
    });
  } catch (err) {
    console.error("Error:", err);

    await logAudit({
      action: "LOGIN_FAILED",
      module: "Auth",
      entityType: "User",
      status: "Failed",
      metadata: { email: req.body.email },
      remarks: "Failed login attempt",
      req,
    }).catch(() => {});

    res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal Server Error" });
  }
};

// ── Change Password ───────────────────────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { newPassword, userId } = req.body;
    await changePasswordService(userId, newPassword);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal Server Error" });
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    await logAudit({
      userId: req.user.id,
      action: "LOGOUT",
      module: "Auth",
      entityType: "User",
      objectAffected: req.user.id,
      status: "Success",
      remarks: "User logged out",
      req,
    }).catch(() => {}); 

    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal Server Error" });
  }
};

// ── Forgot Password ───────────────────────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username required" });
    }

    await requestPasswordReset(username);

    return res.json({
      success: true,
      message: "If an account was found, a reset request has been submitted for admin approval.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ── Reset Password (user submits new password with token) ────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and password required" });
    }

    await resetPasswordService(token, newPassword);
    return res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err.message || "Invalid or expired token" });
  }
};

// ── GET /auth/reset-requests — admin fetches all requests for their org ───────
export const getResetRequests = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;

    const requests = await PasswordResetRequest.findAll({
      where: { organizationId },
      order: [["requestedAt", "DESC"]],
    });

    return res.json({ success: true, requests });
  } catch (err) {
    console.error("❌ ERROR in getResetRequests:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ── POST /auth/reset-requests/:id/approve — admin approves, gets the link ────
export const approveResetRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const resetLink = await approvePasswordResetRequest(id);
    return res.json({ success: true, resetLink });
  } catch (err) {
    console.error(err);
    return res.status(err.statusCode || 500).json({ message: err.message || "Internal server error" });
  }
};

// ── POST /auth/reset-requests/:id/reject — admin rejects the request ─────────
export const rejectResetRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await rejectPasswordResetRequest(id);
    return res.json({ success: true, message: "Request rejected" });
  } catch (err) {
    console.error(err);
    return res.status(err.statusCode || 500).json({ message: err.message || "Internal server error" });
  }
};

export const getResetLink = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username required" });
    }

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.json({ message: "If approved, reset link will be available" });
    }

    if (!user.resetPasswordToken) {
      return res.json({ message: "Reset request not approved yet" });
    }

    if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
      return res.json({ message: "Reset link expired. Request again." });
    }

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${user.resetPasswordToken}`;

    return res.json({ success: true, resetLink });
  } catch (err) {
    console.error("Error in getResetLink:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};