// src/controllers/auth.controller.js
import {
    registerUser,
    loginUser,
    changePassword as changePasswordService
} from "../services/auth.service.js";

import { generateToken } from "../utils/token.js";


// ✅ REGISTER
export const register = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await registerUser(username, password);

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


// ✅ LOGIN
export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const { user, forcePasswordChange } = await loginUser(
            username,
            password,
            req
        );

        const token = generateToken(user);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,       // ⚠️ set false in local dev if no HTTPS
            sameSite: "strict"
        });

        res.json({
            success: true,
            message: "Login successful",
            forcePasswordChange
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Internal Server Error"
        });
    }
};


// 🔁 CHANGE PASSWORD
export const changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { newPassword } = req.body;

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


// 🚪 LOGOUT
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