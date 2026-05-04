const { Camera } = require("../models/Camera.js");

const createCamera = async (data) => {
    return await Camera.create(data);
};

const getAllCameras = async (organizationId) => {
    return await Camera.findAll({ where: { organizationId } });
};

const getCameraById = async (id, organizationId) => {
    return await Camera.findOne({ where: { id, organizationId } });
};

const updateCamera = async (id, data, organizationId) => {
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

const updateCameraSettings = async (id, settings, organizationId) => {
    const camera = await Camera.findOne({ where: { id, organizationId } });
    if (!camera) return null;

    const updateData = {};

    if (settings.detection !== undefined) updateData.detection = Boolean(settings.detection);

    // ✅ Accept both snake_case (from frontend) and camelCase
    const alertSound = settings.alertSound ?? settings.alert_sound;
    if (alertSound !== undefined) updateData.alertSound = Boolean(alertSound);

    const frameRate = settings.frameRate ?? settings.frame_rate;
    if (frameRate !== undefined) updateData.frameRate = Number(frameRate);

    if (settings.resolution !== undefined) updateData.resolution = String(settings.resolution);

    if (Object.keys(updateData).length === 0) return camera;

    await camera.update(updateData);
    return camera;
};

const deleteCamera = async (id, organizationId) => {
    const camera = await Camera.findOne({ where: { id, organizationId } });
    if (!camera) return false;

    await camera.destroy();
    return true;
};

module.exports = {
    createCamera,
    getAllCameras,
    getCameraById,
    updateCamera,
    updateCameraSettings,
    deleteCamera,
};
