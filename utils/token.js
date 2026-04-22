// utils/token.js
import jwt from "jsonwebtoken";

// Access token — short lived (15min)
export const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
    );
};

// Refresh token — long lived (7 days)
export const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
};