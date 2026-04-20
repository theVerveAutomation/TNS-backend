import * as auditLogService from "../services/auditlog.service.js";
import { AuditLog, User } from "../models/index.js";

export const createAuditLog = async (req, res) => {
    try {
        const auditLog = await auditLogService.createAuditLog(req.body);
        res.status(201).json({ success: true, auditLog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

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

export const getAuditLogById = async (req, res) => {
    try {
        const auditLog = await auditLogService.getAuditLogById(req.params.id);
        if (!auditLog) return res.status(404).json({ success: false, message: "AuditLog not found" });
        res.json({ success: true, auditLog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateAuditLog = async (req, res) => {
    try {
        const auditLog = await auditLogService.updateAuditLog(req.params.id, req.body);
        if (!auditLog) return res.status(404).json({ success: false, message: "AuditLog not found" });
        res.json({ success: true, auditLog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteAuditLog = async (req, res) => {
    try {
        const result = await auditLogService.deleteAuditLog(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: "AuditLog not found" });
        res.json({ success: true, message: "AuditLog deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
