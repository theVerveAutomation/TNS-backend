const cameraSnapService = require("../services/camerasnap.service.js");

const createCameraSnap = async (req, res) => {
    try {
        const cameraSnap = await cameraSnapService.createCameraSnap(req.body);
        res.status(201).json({ success: true, cameraSnap });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getAllCameraSnaps = async (req, res) => {
    try {
        const cameraSnaps = await cameraSnapService.getAllCameraSnaps();
        res.json({ success: true, cameraSnaps });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getCameraSnapById = async (req, res) => {
    try {
        const cameraSnap = await cameraSnapService.getCameraSnapById(req.params.id);
        if (!cameraSnap) return res.status(404).json({ success: false, message: "CameraSnap not found" });
        res.json({ success: true, cameraSnap });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateCameraSnap = async (req, res) => {
    try {
        const cameraSnap = await cameraSnapService.updateCameraSnap(req.params.id, req.body);
        if (!cameraSnap) return res.status(404).json({ success: false, message: "CameraSnap not found" });
        res.json({ success: true, cameraSnap });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteCameraSnap = async (req, res) => {
    try {
        const result = await cameraSnapService.deleteCameraSnap(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: "CameraSnap not found" });
        res.json({ success: true, message: "CameraSnap deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    createCameraSnap,
    getAllCameraSnaps,
    getCameraSnapById,
    updateCameraSnap,
    deleteCameraSnap,
};
