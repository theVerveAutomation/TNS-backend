const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");

const AlertSchedule = sequelize.define("AlertSchedule", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  organizationId: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  startTime: {
    type: DataTypes.STRING, // "09:00"
  },

  endTime: {
    type: DataTypes.STRING,
  },

  daysOfWeek: {
    type: DataTypes.JSON, // ["Mon","Tue"]
  },

  quietHoursEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  quietHoursStart: {
    type: DataTypes.STRING,
  },

  quietHoursEnd: {
    type: DataTypes.STRING,
  },

  timezone: {
    type: DataTypes.STRING,
    defaultValue: "Asia/Singapore",
  },
}, {
  tableName: "alert_schedules",
});

module.exports = { AlertSchedule };