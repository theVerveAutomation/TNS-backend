const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");
const { Camera } = require("./Camera.js");
const { User } = require("./User.js");

const CameraException = sequelize.define("CameraException", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    cameraId: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    lastOnline: DataTypes.DATE,
    lastOffline: DataTypes.DATE,
    downtimeMinutes: DataTypes.INTEGER,
    issueDescription: DataTypes.TEXT,
    assignedTo: DataTypes.UUID,
    status: {
        type: DataTypes.STRING,
        defaultValue: "Offline",
    },
}, {
    tableName: "camera_exceptions",
    underscored: true,
    timestamps: true,
    updatedAt: false,
});

// Define Relationships
CameraException.belongsTo(Camera, { foreignKey: "cameraId" });
Camera.hasMany(CameraException, { foreignKey: "cameraId" });

CameraException.belongsTo(User, { foreignKey: "assignedTo" });
User.hasMany(CameraException, { foreignKey: "assignedTo" });

module.exports = { CameraException };