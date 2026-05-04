const { AuditLog } = require("../models/AuditLog.js");
const { User } = require("../models/User.js");
const { Camera } = require("../models/Camera.js");
const { Alert } = require("../models/Alert.js");

const logAudit = async ({
  userId = null,
  action,
  module,
  objectAffected: entityId,
  entityType = null,
  oldValue = null,
  newValue = null,
  metadata = null,
  status = "Success",
  description = "",
  remarks = "",
  req = null,
}) => {
  try {
    let finalMetadata = metadata || {};

    // 🔥 AUTO-RESOLVE FRIENDLY NAME
    if (!metadata && entityId && entityType) {
      switch (entityType) {
        case "User": {
          const user = await User.findByPk(entityId);
          if (user) {
            finalMetadata.name = user.username;
            finalMetadata.role = user.role;
          }
          break;
        }

        case "Camera": {
          const camera = await Camera.findByPk(entityId);
          if (camera) {
            finalMetadata.name = camera.name;
            finalMetadata.location = camera.location;
          }
          break;
        }

        case "Alert": {
          const alert = await Alert.findByPk(entityId);
          if (alert) {
            finalMetadata.type = alert.alertType;
            finalMetadata.status = alert.status;
          }
          break;
        }

        default:
          break;
      }
    }

    await AuditLog.create({
      userId,
      action,
      module,
      objectAffected: entityId,
      entityType,
      oldValue,
      newValue,
      metadata: finalMetadata,
      status,
      remarks: description || remarks || null,
      ipAddress: req?.ip,
      userAgent: req?.headers["user-agent"],
    });

  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
};

module.exports = { logAudit };