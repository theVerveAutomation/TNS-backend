const { CameraSnap } = require("../models/CameraSnap.js");

const createCameraSnap = async (data) => {
    return await CameraSnap.create(data);
};

const getAllCameraSnaps = async () => {
    return await CameraSnap.findAll();
};

const getCameraSnapById = async (id) => {
    return await CameraSnap.findByPk(id);
};

const updateCameraSnap = async (id, data) => {
    const cameraSnap = await CameraSnap.findByPk(id);
    if (!cameraSnap) return null;
    await cameraSnap.update(data);
    return cameraSnap;
};

const deleteCameraSnap = async (id) => {
    const cameraSnap = await CameraSnap.findByPk(id);
    if (!cameraSnap) return false;
    await cameraSnap.destroy();
    return true;
};

module.exports = {
    createCameraSnap,
    getAllCameraSnaps,
    getCameraSnapById,
    updateCameraSnap,
    deleteCameraSnap,
};
