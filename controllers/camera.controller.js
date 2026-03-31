import * as cameraService from "../services/camera.service.js";

export const createCamera = async (req, res) => {
    try {
        const camera = await cameraService.createCamera(req.body);
        res.status(201).json({ success: true, camera });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getAllCameras = async (req, res) => {
    try {
        const cameras = await cameraService.getAllCameras();
        res.json({ success: true, cameras });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getCameraById = async (req, res) => {
    try {
        const camera = await cameraService.getCameraById(req.params.id);
        if (!camera) return res.status(404).json({ success: false, message: "Camera not found" });
        res.json({ success: true, camera });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateCamera = async (req, res) => {
    try {
        const camera = await cameraService.updateCamera(req.params.id, req.body);
        if (!camera) return res.status(404).json({ success: false, message: "Camera not found" });
        res.json({ success: true, camera });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteCamera = async (req, res) => {
    try {
        const result = await cameraService.deleteCamera(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: "Camera not found" });
        res.json({ success: true, message: "Camera deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
