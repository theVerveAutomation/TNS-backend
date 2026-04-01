// src/routes/auth.routes.js
import express from "express";
import {
    register,
    login,
    changePassword,
    logout,
    forgotPassword,
    resetPassword
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔐 Register
router.post("/register", register);

// 🔐 Login
router.post("/login", login);

// 🔐 Change Password (protected)
router.post("/change-password", changePassword);

// 🔐 Logout
router.post("/logout", protect, logout);

export const forgotPasswordRoute = express.Router();
forgotPasswordRoute.post("/", forgotPassword);

export const resetPasswordRoute = express.Router();
resetPasswordRoute.post("/", resetPassword);

export default router;