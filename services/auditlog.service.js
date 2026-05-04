const { AuditLog } = require("../models/AuditLog.js");

const createAuditLog = async (data) => {
    return await AuditLog.create(data);
};

const getAllAuditLogs = async () => {
    return await AuditLog.findAll();
};

const getAuditLogById = async (id) => {
    return await AuditLog.findByPk(id);
};

const updateAuditLog = async (id, data) => {
    const auditLog = await AuditLog.findByPk(id);
    if (!auditLog) return null;
    await auditLog.update(data);
    return auditLog;
};

const deleteAuditLog = async (id) => {
    const auditLog = await AuditLog.findByPk(id);
    if (!auditLog) return false;
    await auditLog.destroy();
    return true;
};

module.exports = {
    createAuditLog,
    getAllAuditLogs,
    getAuditLogById,
    updateAuditLog,
    deleteAuditLog,
};
