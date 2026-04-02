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
    cameraId: DataTypes.UUID,
    alertType: DataTypes.STRING,
    message: DataTypes.TEXT,
    snapshotUrl: DataTypes.STRING,
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
    actionTaken: DataTypes.TEXT,
    acknowledgedBy: DataTypes.UUID,
    responseTimeMin: DataTypes.INTEGER,
}, {
    tableName: "alerts",
    underscored: true,
    timestamps: true,
    updatedAt: false, // Only uses created_at based on schema
});

// Define Relationships
Alert.belongsTo(Camera, { foreignKey: "cameraId" });
Camera.hasMany(Alert, { foreignKey: "cameraId" });

Alert.belongsTo(User, { foreignKey: "acknowledgedBy" });
User.hasMany(Alert, { foreignKey: "acknowledgedBy" });