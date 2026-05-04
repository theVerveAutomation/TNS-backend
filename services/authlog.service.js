const { AuthLog } = require("../models/AuthLog.js");

const createAuthLog = async (data) => {
    return await AuthLog.create(data);
};

const getAllAuthLogs = async () => {
    return await AuthLog.findAll();
};

const getAuthLogsByuserId = async (userId) => {
    return await AuthLog.findAll({ where: { userId } });
};

const getAuthLogById = async (id) => {
    return await AuthLog.findByPk(id);
};

const updateAuthLog = async (id, data) => {
    const authLog = await AuthLog.findByPk(id);
    if (!authLog) return null;
    await authLog.update(data);
    return authLog;
};

const deleteAuthLog = async (id) => {
    const authLog = await AuthLog.findByPk(id);
    if (!authLog) return false;
    await authLog.destroy();
    return true;
};

module.exports = {
    createAuthLog,
    getAllAuthLogs,
    getAuthLogsByuserId,
    getAuthLogById,
    updateAuthLog,
    deleteAuthLog,
};
