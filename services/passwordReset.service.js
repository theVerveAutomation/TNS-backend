// services/passwordReset.service.js
import crypto from "crypto";
import { User } from "../models/User.js";
import { PasswordResetRequest } from "../models/PasswordResetRequest.js";
import { AppError } from "../utils/AppError.js";

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

// ── Called when user submits forgot-password form ────────────────────────────
// Does NOT generate a link. Just saves a pending request for admin to review.
export const requestPasswordReset = async (username) => {
  const user = await User.findOne({ where: { username } });

  // Always resolve silently — don't reveal if username exists or not
  if (!user) return;

  // Check if there's already a pending request for this user — don't spam
  const existing = await PasswordResetRequest.findOne({
    where: { userId: user.id, status: "pending" },
  });

  if (existing) return; // already pending, do nothing

  await PasswordResetRequest.create({
    userId: user.id,
    username: user.username,
    email: user.email,
    organizationId: user.organizationId,
    status: "pending",
    requestedAt: new Date(),
  });
};

// ── Called when admin approves a request ─────────────────────────────────────
// Generates the actual reset token + link and returns it to the admin.
export const approvePasswordResetRequest = async (requestId) => {
  const request = await PasswordResetRequest.findByPk(requestId);

  if (!request) throw new AppError(404, "Reset request not found");
  if (request.status !== "pending") throw new AppError(400, "Request is no longer pending");

  const user = await User.findByPk(request.userId);
  if (!user) throw new AppError(404, "User not found");

  // Generate a secure token and expiry
  const token = crypto.randomBytes(32).toString("hex");
  const expiry = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  // Save token on the user record
  await user.update({
    resetPasswordToken: token,
    resetPasswordExpires: expiry,
  });

  // Mark request as approved
  await request.update({
    status: "approved",
    resolvedAt: new Date(),
  });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  return resetLink;
};

// ── Called when admin rejects a request ──────────────────────────────────────
export const rejectPasswordResetRequest = async (requestId) => {
  const request = await PasswordResetRequest.findByPk(requestId);

  if (!request) throw new AppError(404, "Reset request not found");
  if (request.status !== "pending") throw new AppError(400, "Request is no longer pending");

  await request.update({
    status: "rejected",
    resolvedAt: new Date(),
  });
};

// ── Called when user submits the reset-password form with token ───────────────
export const resetPasswordService = async (token, newPassword) => {
  const user = await User.findOne({
    where: { resetPasswordToken: token },
  });

  if (!user) throw new AppError(400, "Invalid or expired reset token");
  if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
    throw new AppError(400, "Reset token has expired. Please request a new one.");
  }

  // Delegate to auth service change password logic
  const { changePassword } = await import("./auth.service.js");
  await changePassword(user.id, newPassword);

  // Clear the token
  await user.update({
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });
};