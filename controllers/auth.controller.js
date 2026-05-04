// src/controllers/auth.controller.js
const jwt = require("jsonwebtoken");
const {
  registerUser,
  loginUser,
  changePassword: changePasswordService,
} = require("../services/auth.service.js");
const { User } = require("../models/User.js");
const { generateToken, generateRefreshToken } = require("../utils/token.js");
const {
  requestPasswordReset,
  resetPasswordService,
  approvePasswordResetRequest,
  rejectPasswordResetRequest,
} = require("../services/passwordReset.service.js");
const { PasswordResetRequest } = require("../models/PasswordResetRequest.js");
const { logAudit } = require("../utils/auditLogger.js");

// ── Register ──────────────────────────────────────────────────────────────────
const register = async (req, res) => {
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
const login = async (req, res) => {
  try {
    const { organizationId, username, password } = req.body;
    const { user, forcePasswordChange } = await loginUser(organizationId, username, password, req);

    const access_token  = generateToken(user);
    const refresh_token = generateRefreshToken(user);

    await logAudit({
      userId: user.id,
      action: "LOGIN_SUCCESS",
      module: "Auth",
      entityType: "User",
      objectAffected: user.id,
      status: "Success",
      remarks: `User ${user.username} logged in`,
      req,
    }).catch(() => {});

    res.json({
      success: true,
      message: "Login successful",
      forcePasswordChange,
      token: { access_token },
      refresh_token,
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

// ── Refresh Token ─────────────────────────────────────────────────────────────
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(401).json({ success: false, message: "No refresh token provided" });
    }

    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_TOKEN_SECRET);

    const user = await User.findOne({ where: { id: decoded.id } }); 
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const access_token = generateToken(user);

    return res.json({ success: true, token: { access_token } });

  } catch (err) {
    console.error("Error refreshing token:", err);
    return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
  }
};

// ── Change Password ───────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { newPassword, userId } = req.body;
    await changePasswordService(userId, newPassword);
    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal Server Error" });
  }
};

// ── Logout ────────────────────────────────────────────────────────────────────
const logout = async (req, res) => {
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
    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal Server Error" });
  }
};

// ── Forgot Password ───────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: "Username required" });
    }

    await requestPasswordReset(username);

    return res.json({
      success: true,
      message: "If an account was found, a reset request has been submitted for admin approval.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── Reset Password ────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Token and password required" });
    }

    await resetPasswordService(token, newPassword);
    return res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ success: false, message: err.message || "Invalid or expired token" });
  }
};

// ── GET /auth/reset-requests ──────────────────────────────────────────────────
const getResetRequests = async (req, res) => {
  try {
    const organizationId = req.user?.organizationId;

    const requests = await PasswordResetRequest.findAll({
      where: { organizationId },
      order: [["requestedAt", "DESC"]],
    });

    return res.json({ success: true, requests });
  } catch (err) {
    console.error("❌ ERROR in getResetRequests:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ── POST /auth/reset-requests/:id/approve ────────────────────────────────────
const approveResetRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const resetLink = await approvePasswordResetRequest(id);
    return res.json({ success: true, resetLink });
  } catch (err) {
    console.error(err);
    return res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal server error" });
  }
};

// ── POST /auth/reset-requests/:id/reject ─────────────────────────────────────
const rejectResetRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await rejectPasswordResetRequest(id);
    return res.json({ success: true, message: "Request rejected" });
  } catch (err) {
    console.error(err);
    return res.status(err.statusCode || 500).json({ success: false, message: err.message || "Internal server error" });
  }
};

// ── GET reset link ────────────────────────────────────────────────────────────
const getResetLink = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ success: false, message: "Username required" });
    }

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.json({ success: false, message: "If approved, reset link will be available" });
    }

    if (!user.resetPasswordToken) {
      return res.json({ success: false, message: "Reset request not approved yet" });
    }

    if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
      return res.json({ success: false, message: "Reset link expired. Request again." });
    }

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${user.resetPasswordToken}`;

    return res.json({ success: true, resetLink });
  } catch (err) {
    console.error("Error in getResetLink:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
  getResetRequests,
  approveResetRequest,
  rejectResetRequest,
  getResetLink,
};