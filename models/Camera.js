import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export const Camera = sequelize.define("Camera", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    organizationId: {
        type: DataTypes.STRING,   // ← matches User.organizationId type
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM("normal", "warning", "offline"),
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
}, {
    tableName: "cameras",
    underscored: true,
    timestamps: true,
});