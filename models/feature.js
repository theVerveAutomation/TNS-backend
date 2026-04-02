import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

export const Feature = sequelize.define("Feature", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    icon: {
        type: DataTypes.STRING,
        defaultValue: "⚙️",
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: "features",
    underscored: true,
    timestamps: true,
});