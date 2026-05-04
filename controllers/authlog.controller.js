const authLogService = require("../services/authlog.service.js");

const createAuthLog = async (req, res) => {
    try {
        const authLog = await authLogService.createAuthLog(req.body);
        res.status(201).json({ success: true, authLog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getAllAuthLogs = async (req, res) => {
    try {
        const authLogs = await authLogService.getAllAuthLogs();
        res.json({ success: true, authLogs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getAuthLogById = async (req, res) => {
    try {
        const authLog = await authLogService.getAuthLogById(req.params.id);
        if (!authLog) return res.status(404).json({ success: false, message: "AuthLog not found" });
        res.json({ success: true, authLog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateAuthLog = async (req, res) => {
    try {
        const authLog = await authLogService.updateAuthLog(req.params.id, req.body);
        if (!authLog) return res.status(404).json({ success: false, message: "AuthLog not found" });
        res.json({ success: true, authLog });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteAuthLog = async (req, res) => {
    try {
        const result = await authLogService.deleteAuthLog(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: "AuthLog not found" });
        res.json({ success: true, message: "AuthLog deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    createAuthLog,
    getAllAuthLogs,
    getAuthLogById,
    updateAuthLog,
    deleteAuthLog,
};