import { AuditLog } from "../models/AuditLog.js";

export const createAuditLog = async (data) => {
    return await AuditLog.create(data);
};

export const getAllAuditLogs = async () => {
    return await AuditLog.findAll();
};

export const getAuditLogById = async (id) => {
    return await AuditLog.findByPk(id);
};

export const updateAuditLog = async (id, data) => {
    const auditLog = await AuditLog.findByPk(id);
    if (!auditLog) return null;
    await auditLog.update(data);
    return auditLog;
};

export const deleteAuditLog = async (id) => {
    const auditLog = await AuditLog.findByPk(id);
    if (!auditLog) return false;
    await auditLog.destroy();
    return true;
};
