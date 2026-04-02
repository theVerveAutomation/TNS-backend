import crypto from "crypto";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { PasswordReset } from "../models/PasswordReset.js";

export const requestPasswordReset = async (username) => {
  const user = await User.findOne({ where: { username } });
  if (!user) return null;

  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  await PasswordReset.destroy({
    where: { user_id: user.id }
  });

  await PasswordReset.create({
    user_id: user.id,
    token: hashedToken,
    expires_at: new Date(Date.now() + 15 * 60 * 1000),
    used: false,
  });

  const resetLink = `http://localhost:3000/reset-password?token=${rawToken}`;

  return resetLink; // 👈 returned to controller
};


export const resetPasswordService = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const reset = await PasswordReset.findOne({
    where: {
      token: hashedToken,
      used: false
    }
  });

  if (!reset) {
    throw new Error("Invalid token");
  }

  if (new Date() > reset.expires_at) {
    throw new Error("Token expired");
  }

  const user = await User.findByPk(reset.user_id);

  if (!user) {
    throw new Error("User not found");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await user.update({
    password: hashedPassword
  });

  await reset.update({
    used: true
  });

  return true;
};