// services/auth.service.js
const { hashPassword, comparePassword, validatePassword } = require("../utils/password.js");
const { User } = require("../models/User.js");
const { AuthLog } = require("../models/AuthLog.js");
const { AppError } = require("../utils/AppError.js");
const bcrypt = require("bcryptjs");

const registerUser = async (organizationId = "org02", username, email, password, role) => {
    const existingUser = await User.findOne({ where: { organizationId, username } });
    if (existingUser) {
        throw new AppError(409, "User already exists");
    }
    validatePassword(password, username);
    const hashed = await hashPassword(password);

    const newUser = await User.create({
        organizationId,
        email,
        username,
        password: hashed,
        role: role || "user",
        passwordHistory: [hashed],
        passwordChangedAt: new Date()
    });

    return {
        user: {
            id: newUser.id,
            organizationId: newUser.organizationId,
            email: newUser.email,
            role: newUser.role,
            username: newUser.username
        }
    };
};

const loginUser = async (organizationId = "org02", username, password, req) => {
    const user = await User.findOne({ where: { organizationId, username } });
    if (!user) {
        throw new AppError(404, `User not found with username: ${username}`);
    }

    const log = async (status, description) => {
        await AuthLog.create({
            userId: user?.id,
            username,
            status,
            description,
            ip: req.ip,
            userAgent: req.headers["user-agent"]
        });
    };

    // 🔒 LOCK CHECK
    if (user.lockUntil && new Date() < user.lockUntil) {
        await log("FAIL", "Attempt to login to locked account");
        throw new AppError(423, "Account locked. Try later.");
    }

    // 🚫 INACTIVE CHECK — use .toLowerCase() to handle any casing in DB
    if (user.status?.toLowerCase() === "inactive") {
        await log("FAIL", "Attempt to login to inactive account");
        throw new AppError(403, "Your account is inactive. Please contact admin support.");
    }

    // 🔑 VERIFY PASSWORD
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        const attempts = user.failedAttempts + 1;
        if (attempts >= 6) {
            await user.update({
                failedAttempts: 0,
                lockUntil: new Date(Date.now() + 15 * 60 * 1000)
            });
        } else {
            await user.update({ failedAttempts: attempts });
        }
        await log("FAIL", "Invalid password attempt");
        throw new AppError(401, "Invalid Credentials");
    }

    // ✅ SUCCESS — reset failed attempts
    await user.update({
        failedAttempts: 0,
        lockUntil: null,
        lastLoginAt: new Date(),
        lastActivityAt: new Date()
    });

    await log("SUCCESS", "User logged in successfully");

    // 🔁 PASSWORD EXPIRY (90 days)
    const expired =
        Date.now() - new Date(user.passwordChangedAt).getTime() >
        90 * 24 * 60 * 60 * 1000;

    return {
        user,
        forcePasswordChange: user.isFirstLogin || expired
    };
};

const changePassword = async (userId, newPassword) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new AppError(404, `User not found with id: ${userId}`);
    }
    validatePassword(newPassword, user.username);

    // ❌ REUSE CHECK
    const historyArr = Array.isArray(user.passwordHistory) ? user.passwordHistory : [];
    for (const old of historyArr) {
        if (await comparePassword(newPassword, old)) {
            throw new Error("Cannot reuse last 3 passwords");
        }
    }

    const hashed = await hashPassword(newPassword);
    const newHistory = [...historyArr, hashed].slice(-3);

    await user.update({
        password: hashed,
        passwordHistory: newHistory,
        passwordChangedAt: new Date(),
        isFirstLogin: false
    });
};

module.exports = { registerUser, loginUser, changePassword };
