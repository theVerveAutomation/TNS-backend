import { AuthLog } from "../models/AuthLog.js";

export const createAuthLog = async (data) => {
    return await AuthLog.create(data);
};

export const getAllAuthLogs = async () => {
    return await AuthLog.findAll();
};

export const getAuthLogsByuserId = async (userId) => {
    return await AuthLog.findAll({ where: { userId } });
};

export const getAuthLogById = async (id) => {
    return await AuthLog.findByPk(id);
};

export const updateAuthLog = async (id, data) => {
    const authLog = await AuthLog.findByPk(id);
    if (!authLog) return null;
    await authLog.update(data);
    return authLog;
};

export const deleteAuthLog = async (id) => {
    const authLog = await AuthLog.findByPk(id);
    if (!authLog) return false;
    await authLog.destroy();
    return true;
};
