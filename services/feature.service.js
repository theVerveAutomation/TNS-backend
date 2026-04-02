import { Feature } from "../models/feature.js";

export const createFeature = async (data) => {
    return await Feature.create(data);
};

export const getAllFeatures = async () => {
    return await Feature.findAll();
};

export const getFeatureById = async (id) => {
    return await Feature.findByPk(id);
};

export const updateFeature = async (id, data) => {
    const f = await Feature.findByPk(id);
    if (!f) return null;
    await f.update(data);
    return f;
};

export const deleteFeature = async (id) => {
    const f = await Feature.findByPk(id);
    if (!f) return false;
    await f.destroy();
    return true;
};
