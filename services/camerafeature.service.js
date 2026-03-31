import { CameraFeature } from "../models/CameraFeature.js";

export const createCameraFeature = async (data) => {
    return await CameraFeature.create(data);
};

export const getAllCameraFeatures = async () => {
    return await CameraFeature.findAll();
};

export const getCameraFeatureById = async (id) => {
    return await CameraFeature.findByPk(id);
};

export const updateCameraFeature = async (id, data) => {
    const cameraFeature = await CameraFeature.findByPk(id);
    if (!cameraFeature) return null;
    await cameraFeature.update(data);
    return cameraFeature;
};

export const deleteCameraFeature = async (id) => {
    const cameraFeature = await CameraFeature.findByPk(id);
    if (!cameraFeature) return false;
    await cameraFeature.destroy();
    return true;
};
