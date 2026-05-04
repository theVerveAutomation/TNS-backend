const cameraExceptionService = require("../services/cameraexception.service.js");

const createCameraException = async (req, res) => {
    try {
        const cameraException = await cameraExceptionService.createCameraException(req.body);
        res.status(201).json({ success: true, cameraException });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getAllCameraExceptions = async (req, res) => {
    try {
        const cameraExceptions = await cameraExceptionService.getAllCameraExceptions();
        res.json({ success: true, cameraExceptions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getCameraExceptionById = async (req, res) => {
    try {
        const cameraException = await cameraExceptionService.getCameraExceptionById(req.params.id);
        if (!cameraException) return res.status(404).json({ success: false, message: "CameraException not found" });
        res.json({ success: true, cameraException });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateCameraException = async (req, res) => {
    try {
        const cameraException = await cameraExceptionService.updateCameraException(req.params.id, req.body);
        if (!cameraException) return res.status(404).json({ success: false, message: "CameraException not found" });
        res.json({ success: true, cameraException });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteCameraException = async (req, res) => {
    try {
        const result = await cameraExceptionService.deleteCameraException(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: "CameraException not found" });
        res.json({ success: true, message: "CameraException deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    createCameraException,
    getAllCameraExceptions,
    getCameraExceptionById,
    updateCameraException,
    deleteCameraException,
};
