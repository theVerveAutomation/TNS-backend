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

export const updateCameraSettings = async (id, settings, organizationId) => {
    const camera = await Camera.findOne({ where: { id, organizationId } });
    if (!camera) return null;

    // Whitelist settings fields that can be changed via the settings endpoint
    const allowed = ["detection", "alertSound", "resolution"];
    const updateData = {};

    if (settings.detection !== undefined) updateData.detection = Boolean(settings.detection);
    if (settings.alertSound !== undefined) updateData.alertSound = Boolean(settings.alertSound);
    if (settings.resolution !== undefined) updateData.resolution = String(settings.resolution);

    // If no allowed fields provided, do nothing
    if (Object.keys(updateData).length === 0) return camera;

    await camera.update(updateData);
    return camera;
};

export const deleteCamera = async (id, organizationId) => {
    const camera = await Camera.findOne({ where: { id, organizationId } });
    if (!camera) return false;

    await camera.destroy();
    return true;
};