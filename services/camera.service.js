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
    // Apply everything from payload except immutable fields
    const { id: _omitId, organizationId: _omitOrg, ...updateData } = data;

    // If payload contains nested objects that map to underscored columns
    // (e.g., someClientField -> some_client_field), Sequelize will handle
    // attribute mapping when column names are defined in the model.

    await camera.update(updateData);
    return camera;
};

export const deleteCamera = async (id, organizationId) => {
    const camera = await Camera.findOne({ where: { id, organizationId } });
    if (!camera) return false;

    await camera.destroy();
    return true;
};