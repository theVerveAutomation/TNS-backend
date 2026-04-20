// controllers/audit.controller.js
import { AuditLog, User } from "../models/index.js";

export const getAuditLogs = async (req, res) => {
  try {
console.log("INCLUDE CHECK:", AuditLog.associations);

    const logs = await AuditLog.findAll({
      order: [["timestamp", "DESC"]],
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "username", "role"],
          required: false,
        },
      ],
    });

    console.log("TOTAL LOGS:", logs.length);

    if (logs.length > 0) {
      console.log("FIRST LOG:", logs[0].toJSON());
    } else {
      console.log("NO LOGS FOUND");
    }

    res.json({
      success: true,
      auditLogs: logs,
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching audit logs" });
  }
};