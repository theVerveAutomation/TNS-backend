const { User } = require("./User.js");
const { AuditLog } = require("./AuditLog.js");

AuditLog.belongsTo(User, {
  foreignKey: "user_id",
  as: "User",
});

User.hasMany(AuditLog, {
  foreignKey: "user_id",
  as: "auditLogs",
});

module.exports = { User, AuditLog };