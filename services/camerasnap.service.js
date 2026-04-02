import { CameraSnap } from "../models/CameraSnap.js";

export const createCameraSnap = async (data) => {
    return await CameraSnap.create(data);
};

export const getAllCameraSnaps = async () => {
    return await CameraSnap.findAll();
};

export const getCameraSnapById = async (id) => {
    return await CameraSnap.findByPk(id);
};

export const updateCameraSnap = async (id, data) => {
    const cameraSnap = await CameraSnap.findByPk(id);
    if (!cameraSnap) return null;
    await cameraSnap.update(data);
    return cameraSnap;
};

export const deleteCameraSnap = async (id) => {
    const cameraSnap = await CameraSnap.findByPk(id);
    if (!cameraSnap) return false;
    await cameraSnap.destroy();
    return true;
};
