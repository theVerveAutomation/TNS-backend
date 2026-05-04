const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");

const PasswordReset = sequelize.define("password_resets", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
  },
  token: {
    type: DataTypes.TEXT,
  },
  expires_at: {
    type: DataTypes.DATE,
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: false,
});

module.exports = { PasswordReset };