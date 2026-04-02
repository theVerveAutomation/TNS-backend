import * as userService from "../services/user.service.js";

export const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = await userService.updateUser(req.params.id, req.body);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const result = await userService.deleteUser(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, message: "User deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
