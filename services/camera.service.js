import { Camera } from "../models/Camera.js";

export const createCamera = async (data) => {
    return await Camera.create(data);
};

export const getAllCameras = async () => {
    return await Camera.findAll();
};

export const getCameraById = async (id) => {
    return await Camera.findByPk(id);
};

export const updateCamera = async (id, data) => {
    const camera = await Camera.findByPk(id);
    if (!camera) return null;
    await camera.update(data);
    return camera;
};

export const deleteCamera = async (id) => {
    const camera = await Camera.findByPk(id);
    if (!camera) return false;
    await camera.destroy();
    return true;
};
