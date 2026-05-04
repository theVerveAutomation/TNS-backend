const { CameraException } = require("../models/CameraException.js");

const createCameraException = async (data) => {
    return await CameraException.create(data);
};

const getAllCameraExceptions = async () => {
    return await CameraException.findAll();
};

const getCameraExceptionById = async (id) => {
    return await CameraException.findByPk(id);
};

const updateCameraException = async (id, data) => {
    const cameraException = await CameraException.findByPk(id);
    if (!cameraException) return null;
    await cameraException.update(data);
    return cameraException;
};

const deleteCameraException = async (id) => {
    const cameraException = await CameraException.findByPk(id);
    if (!cameraException) return false;
    await cameraException.destroy();
    return true;
};

module.exports = {
    createCameraException,
    getAllCameraExceptions,
    getCameraExceptionById,
    updateCameraException,
    deleteCameraException,
};
