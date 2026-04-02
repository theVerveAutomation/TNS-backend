import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import { Camera } from "./Camera.js";

export const CameraSnap = sequelize.define("CameraSnap", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    cameraId: DataTypes.UUID,
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    captureMethod: {
        type: DataTypes.ENUM("auto", "manual"),
        defaultValue: "auto",
    },
}, {
    tableName: "camera_snaps",
    underscored: true,
    timestamps: true,
    updatedAt: false,
});

// Define Relationships
CameraSnap.belongsTo(Camera, { foreignKey: "cameraId" });
Camera.hasMany(CameraSnap, { foreignKey: "cameraId" });