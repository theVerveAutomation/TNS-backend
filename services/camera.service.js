import { Camera } from "../models/Camera.js";

export const createCamera = async (data) => {
    return await Camera.create(data);
};

export const getAllCameras = async (organizationId) => {
    return await Camera.findAll({ where: { organizationId } });
};

export const getCameraById = async (id, organizationId) => {
    return await Camera.findOne({ where: { id, organizationId } });
};

export const updateCamera = async (id, data, organizationId) => {
    const camera = await Camera.findOne({ where: { id, organizationId } });
    if (!camera) return null;

    const updateData = {};
    // ✅ STRICT: Only name and url allowed
    if (data.name !== undefined) updateData.name = data.name;
    if (data.url !== undefined) updateData.url = data.url;

    await camera.update(updateData);
    return camera;
};

export const deleteCamera = async (id, organizationId) => {
    const camera = await Camera.findOne({ where: { id, organizationId } });
    if (!camera) return false;
    
    await camera.destroy();
    return true;
};