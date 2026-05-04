const { CameraFeature } = require("../models/CameraFeature.js");

const createCameraFeature = async (data) => {
    return await CameraFeature.create(data);
};

const getAllCameraFeatures = async () => {
    return await CameraFeature.findAll();
};

const getCameraFeatureById = async (id) => {
    return await CameraFeature.findByPk(id);
};

const updateCameraFeature = async (id, data) => {
    const cameraFeature = await CameraFeature.findByPk(id);
    if (!cameraFeature) return null;
    await cameraFeature.update(data);
    return cameraFeature;
};

const deleteCameraFeature = async (id) => {
    const cameraFeature = await CameraFeature.findByPk(id);
    if (!cameraFeature) return false;
    await cameraFeature.destroy();
    return true;
};

module.exports = {
    createCameraFeature,
    getAllCameraFeatures,
    getCameraFeatureById,
    updateCameraFeature,
    deleteCameraFeature,
};
