import * as auditLogService from "../services/auditlog.service.js";

export const createAuditLog = async (req, res) => {
    try {
        const auditLog = await auditLogService.createAuditLog(req.body);
        res.status(201).json({ success: true, auditLog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getAllAuditLogs = async (req, res) => {
    try {
        const auditLogs = await auditLogService.getAllAuditLogs();
        res.json({ success: true, auditLogs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
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
