const cameraFeatureService = require("../services/camerafeature.service.js");

const createCameraFeature = async (req, res) => {
    try {
        const cameraFeature = await cameraFeatureService.createCameraFeature(req.body);
        res.status(201).json({ success: true, cameraFeature });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getAllCameraFeatures = async (req, res) => {
    try {
        const cameraFeatures = await cameraFeatureService.getAllCameraFeatures();
        res.json({ success: true, cameraFeatures });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getCameraFeatureById = async (req, res) => {
    try {
        const cameraFeature = await cameraFeatureService.getCameraFeatureById(req.params.id);
        if (!cameraFeature) return res.status(404).json({ success: false, message: "CameraFeature not found" });
        res.json({ success: true, cameraFeature });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateCameraFeature = async (req, res) => {
    try {
        const cameraFeature = await cameraFeatureService.updateCameraFeature(req.params.id, req.body);
        if (!cameraFeature) return res.status(404).json({ success: false, message: "CameraFeature not found" });
        res.json({ success: true, cameraFeature });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteCameraFeature = async (req, res) => {
    try {
        const result = await cameraFeatureService.deleteCameraFeature(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: "CameraFeature not found" });
        res.json({ success: true, message: "CameraFeature deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    createCameraFeature,
    getAllCameraFeatures,
    getCameraFeatureById,
    updateCameraFeature,
    deleteCameraFeature,
};
