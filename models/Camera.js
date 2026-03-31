import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export const Camera = sequelize.define("Camera", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    organizationId: DataTypes.UUID,
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    location: DataTypes.STRING,
    status: {
        type: DataTypes.ENUM("normal", "offline", "maintenance"),
        defaultValue: "normal",
    },
    detection: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    alertSound: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    frameRate: {
        type: DataTypes.INTEGER,
        defaultValue: 30,
    },
    resolution: {
        type: DataTypes.STRING,
        defaultValue: "1080p",
    },
    url: DataTypes.STRING,
    isPhysicalDevice: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    streamUrl: DataTypes.STRING,
}, {
    tableName: "cameras",
    underscored: true,
    timestamps: true,
});