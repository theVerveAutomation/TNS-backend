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
        type: DataTypes.UUID,
        allowNull: false,
    },
    alertType: {
        type: DataTypes.STRING(50), // e.g., 'FALL', 'TUSSLE'
        allowNull: false,
    },
    confidence: {
        type: DataTypes.DECIMAL(4, 3),
        allowNull: true,
    },
    // File pointers on disk
    snapshotPath: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    videoPath: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    message: {
        type: DataTypes.TEXT,
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
    isReviewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: "alerts",
    underscored: true,
    timestamps: true,
    updatedAt: false, // Using created_at only
    indexes: [
        {
            name: "idx_alerts_camera_date",
            fields: ["camera_id", "created_at"],
            order: [["created_at", "DESC"]],
        },
    ],
});

// Relationships
// Note: If Camera.id is a UUID, you might get a warning here. 
// It's best if Camera.id and Alert.cameraId are the same type.
// Keep lightweight relationships but avoid enforcing DB-level foreign keys
try {
    Alert.belongsTo(Camera, { foreignKey: "cameraId", constraints: false });
    Camera.hasMany(Alert, { foreignKey: "cameraId", constraints: false });

    Alert.belongsTo(User, { foreignKey: "acknowledgedBy", constraints: false });
    User.hasMany(Alert, { foreignKey: "acknowledgedBy", constraints: false });
} catch (e) {
    // ignore if models load order causes issues
}