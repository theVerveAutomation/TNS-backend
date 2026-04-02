import * as featureService from "../services/feature.service.js";

export const createFeature = async (req, res) => {
    try {
        const feature = await featureService.createFeature(req.body);
        res.status(201).json({ success: true, feature });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getAllFeatures = async (req, res) => {
    try {
        const features = await featureService.getAllFeatures();
        res.json({ success: true, features });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getFeatureById = async (req, res) => {
    try {
        const feature = await featureService.getFeatureById(req.params.id);
        if (!feature) return res.status(404).json({ success: false, message: "Feature not found" });
        res.json({ success: true, feature });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateFeature = async (req, res) => {
    try {
        const feature = await featureService.updateFeature(req.params.id, req.body);
        if (!feature) return res.status(404).json({ success: false, message: "Feature not found" });
        res.json({ success: true, feature });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteFeature = async (req, res) => {
    try {
        const result = await featureService.deleteFeature(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: "Feature not found" });
        res.json({ success: true, message: "Feature deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
