const { User } = require("../models/User.js");
const {
    getAuthLogsByuserId
} = require("../services/authlog.service.js");

const createUser = async (data) => {
    return await User.create(data);
};

const getAllUsers = async () => {
    return await User.findAll();
};

const getUserById = async (id) => {
    return await User.findByPk(id);
};

const updateUser = async (id, data) => {
    const user = await User.findByPk(id);
    if (!user) return null;

    const payload = data && typeof data === "object" && data.data ? data.data : data;

    const allowedFields = [
        "username",
        "email",
        "organizationId",
        "password",
        "passwordHistory",
        "passwordChangedAt",
        "isFirstLogin",
        "failedAttempts",
        "lockUntil",
        "lastLoginAt",
        "lastActivityAt",
        "status",
        "suspendedAt",
        "role"
    ];

    const updateData = Object.fromEntries(
        Object.entries(payload || {}).filter(([key]) => allowedFields.includes(key))
    );

    await user.update(updateData);
    return user;
};

const deleteUser = async (id) => {
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    await user.destroy();
    return true;
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
};
