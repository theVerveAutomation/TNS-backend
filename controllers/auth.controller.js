// src/controllers/auth.controller.js
import {
    registerUser,
    loginUser,
    changePassword as changePasswordService
} from "../services/auth.service.js";

import { generateToken } from "../utils/token.js";
import { requestPasswordReset, resetPasswordService } from "../services/passwordReset.service.js";


export const register = async (req, res) => {
    try {
        const { organizationId, username, email, password } = req.body;

        const user = await registerUser(organizationId, username, email, password);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal Server Error"
        });
    }
};


export const login = async (req, res, next) => {
    try {
        const { organizationId, username, password } = req.body;

        const { user, forcePasswordChange } = await loginUser(
            organizationId,
            username,
            password,
            req
        );

        const access_token = generateToken(user);

        res.json({
            success: true,
            message: "Login successful",
            forcePasswordChange,
            token: {
                access_token
            },
            user
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal Server Error"
        });
    }
};


export const changePassword = async (req, res, next) => {
    try {
        const { newPassword, userId } = req.body;
        console.log("Changing password for user ID:", userId);

        await changePasswordService(userId, newPassword);

        res.json({
            message: "Password updated successfully"
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal Server Error"
        });
    }
};


export const logout = async (req, res, next) => {
    try {
        res.clearCookie("token");

        res.json({
            message: "Logged out successfully"
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal Server Error"
        });
    }
};


export const forgotPassword = async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: "Username required" });
        }

        const resetLink = await requestPasswordReset(username); // 👈 capture return value

        return res.json({
            success: true,
            message: "Reset link generated",
            resetLink, // 👈 send to frontend
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token and password required" });
        }

        await resetPasswordService(token, newPassword);

        return res.json({
            success: true,
            message: "Password reset successful"
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            message: err.message || "Invalid or expired token"
        });
    }
};