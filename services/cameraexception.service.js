import { CameraException } from "../models/CameraException.js";

export const createCameraException = async (data) => {
    return await CameraException.create(data);
};

export const getAllCameraExceptions = async () => {
    return await CameraException.findAll();
};

export const getCameraExceptionById = async (id) => {
    return await CameraException.findByPk(id);
};

export const updateCameraException = async (id, data) => {
    const cameraException = await CameraException.findByPk(id);
    if (!cameraException) return null;
    await cameraException.update(data);
    return cameraException;
};

export const deleteCameraException = async (id) => {
    const cameraException = await CameraException.findByPk(id);
    if (!cameraException) return false;
    await cameraException.destroy();
    return true;
};
