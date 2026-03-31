import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export const User = sequelize.define("User", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },

    username: {
        type: DataTypes.STRING,
        unique: true
    },

    email: {
        type: DataTypes.STRING,
        unique: true
    },

    organizationId: DataTypes.STRING,

    password: DataTypes.STRING,

    passwordHistory: {
        type: DataTypes.ARRAY(DataTypes.TEXT),
        defaultValue: []
    },

    passwordChangedAt: DataTypes.DATE,

    isFirstLogin: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },

    failedAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

    lockUntil: DataTypes.DATE,

    lastLoginAt: DataTypes.DATE,
    lastActivityAt: DataTypes.DATE,

    status: {
        type: DataTypes.STRING,
        defaultValue: "active"
    },

    suspendedAt: DataTypes.DATE,

    role: {
        type: DataTypes.STRING,
        defaultValue: "user"
    }
}, {
    timestamps: true,
});