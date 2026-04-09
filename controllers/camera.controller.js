import * as cameraService from "../services/camera.service.js";

export const createCamera = async (req, res) => {
    try {
        const { name, url, organization_id } = req.body;

        if (!name || !organization_id) {
            return res.status(400).json({
                success: false,
                error: "name and organization_id are required"
            });
        }

        // ✅ STRICT CREATE: Only allow name, url, and org. 
        // Backend handles status, detection, etc.
        const camera = await cameraService.createCamera({
            name,
            url,
            organizationId: organization_id
        });

        res.status(201).json({ success: true, camera });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const getAllCameras = async (req, res) => {
    try {
        const { organization_id } = req.query;
        if (!organization_id) {
            return res.status(400).json({ success: false, error: "organization_id is required" });
        }

        const cameras = await cameraService.getAllCameras(organization_id);
        res.json({ success: true, cameras });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const getCameraById = async (req, res) => {
    try {
        const { organization_id } = req.query;
        const { id } = req.params;

        if (!organization_id) {
            return res.status(400).json({ success: false, error: "organization_id is required" });
        }

        const camera = await cameraService.getCameraById(id, organization_id);
        if (!camera) {
            return res.status(404).json({ success: false, message: "Camera not found or access denied" });
        }

        res.json({ success: true, camera });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const updateCamera = async (req, res) => {
    try {
        const { id } = req.params;
        const { organization_id } = req.query;
        const { name, url } = req.body; // ✅ STRICT: Only pull name and url

        if (!organization_id) {
            return res.status(400).json({ success: false, error: "organization_id is required" });
        }

        const camera = await cameraService.updateCamera(id, { name, url }, organization_id);

        if (!camera) {
            return res.status(404).json({ success: false, error: "Camera not found or access denied" });
        }

        res.json({ success: true, camera });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const deleteCamera = async (req, res) => {
    try {
        const { id } = req.params;
        const { organization_id } = req.query;

        if (!organization_id) {
            return res.status(400).json({ success: false, error: "organization_id is required" });
        }

        const result = await cameraService.deleteCamera(id, organization_id);
        if (!result) {
            return res.status(404).json({ success: false, message: "Camera not found or access denied" });
        }
        
        res.json({ success: true, message: "Camera deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};