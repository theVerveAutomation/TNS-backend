const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");
const { Camera } = require("./Camera.js");
const { Feature } = require("./feature.js");

const CameraFeature = sequelize.define("CameraFeature", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    cameraId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    featureId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    assignedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    assignedBy: DataTypes.UUID, // User ID
}, {
    tableName: "camera_features",
    underscored: true,
    timestamps: false,
});

// Define Many-to-Many Relationships
Camera.belongsToMany(Feature, { through: CameraFeature, foreignKey: "cameraId" });
Feature.belongsToMany(Camera, { through: CameraFeature, foreignKey: "featureId" });

module.exports = { CameraFeature };