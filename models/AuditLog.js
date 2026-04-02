import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { User } from "./User.js";

export const AuditLog = sequelize.define("AuditLog", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
    userId: DataTypes.UUID,
    module: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    objectAffected: DataTypes.STRING,
    oldValue: DataTypes.TEXT,
    newValue: DataTypes.TEXT,
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    remarks: DataTypes.TEXT,
}, {
    tableName: "audit_logs",
    underscored: true,
    timestamps: false,
});

// Define Relationships
AuditLog.belongsTo(User, { foreignKey: "userId" });
User.hasMany(AuditLog, { foreignKey: "userId" });