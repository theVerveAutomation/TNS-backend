const { Feature } = require("../models/feature.js");

const createFeature = async (data) => {
    return await Feature.create(data);
};

const getAllFeatures = async () => {
    return await Feature.findAll();
};

const getFeatureById = async (id) => {
    return await Feature.findByPk(id);
};

const updateFeature = async (id, data) => {
    const f = await Feature.findByPk(id);
    if (!f) return null;
    await f.update(data);
    return f;
};

const deleteFeature = async (id) => {
    const f = await Feature.findByPk(id);
    if (!f) return false;
    await f.destroy();
    return true;
};

module.exports = {
    createFeature,
    getAllFeatures,
    getFeatureById,
    updateFeature,
    deleteFeature,
};
