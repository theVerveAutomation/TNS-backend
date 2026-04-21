import { User } from "./User.js";
import { AuditLog } from "./AuditLog.js";

AuditLog.belongsTo(User, {
  foreignKey: "user_id",
  as: "User",
});

User.hasMany(AuditLog, {
  foreignKey: "user_id",
  as: "auditLogs",
});

export { User, AuditLog };