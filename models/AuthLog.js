const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");
const { User } = require("./User.js");

const AuthLog = sequelize.define("AuthLog", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    userId: DataTypes.UUID,

    username: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING, // SUCCESS | FAIL
        allowNull: false,
    },
    description: DataTypes.STRING,
    ip: DataTypes.STRING,
    userAgent: DataTypes.STRING,
}, {
    timestamps: true,
});

module.exports = { AuthLog };

// Define relationship
// AuthLog.belongsTo(User, { foreignKey: "userId" });
// User.hasMany(AuthLog, { foreignKey: "userId" });