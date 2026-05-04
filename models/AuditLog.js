const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");
const { User } = require("./User.js");

const AuditLog = sequelize.define("AuditLog", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },

    timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },

    userId: {
        type: DataTypes.UUID,
        field: "user_id"
    },

    module: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    action: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    objectAffected: DataTypes.STRING,

    oldValue: DataTypes.JSONB,   
    newValue: DataTypes.JSONB,   

    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    remarks: DataTypes.TEXT,


    entityType: DataTypes.STRING,  

    metadata: DataTypes.JSONB,    

    ipAddress: DataTypes.STRING,

    userAgent: DataTypes.STRING,

}, {
    tableName: "audit_logs",
    underscored: true,
    timestamps: false, 
});

module.exports = { AuditLog };

