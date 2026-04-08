import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { Camera } from "./Camera.js";
import { User } from "./User.js";

export const Alert = sequelize.define("Alert", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    cameraId: {
        type: DataTypes.UUID, // Changed from UUID to STRING to accept "cam1", "cam2", etc.
        allowNull: false,
    },
    alertType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    snapshotUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    videoUrl: { 
        type: DataTypes.STRING, // Added for your video clips
        allowNull: true,
    },
    severity: {
        type: DataTypes.ENUM("Low", "Medium", "High", "Critical"),
        defaultValue: "Low",
    },
    status: {
        type: DataTypes.ENUM("Open", "Pending", "Closed"),
        defaultValue: "Open",
    },
    validationStatus: {
        type: DataTypes.ENUM("Unverified", "Valid", "False Alarm"),
        defaultValue: "Unverified",
    },
    actionTaken: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    acknowledgedBy: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    responseTimeMin: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
}, {
    tableName: "alerts",
    underscored: true,
    timestamps: true,
    updatedAt: false, // Using created_at only
});

// Relationships
// Note: If Camera.id is a UUID, you might get a warning here. 
// It's best if Camera.id and Alert.cameraId are the same type.
Alert.belongsTo(Camera, { foreignKey: "cameraId" });
Camera.hasMany(Alert, { foreignKey: "cameraId" });

Alert.belongsTo(User, { foreignKey: "acknowledgedBy" });
User.hasMany(Alert, { foreignKey: "acknowledgedBy" });