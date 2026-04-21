import * as cameraService from "../services/camera.service.js";
import { buildRtspUrl } from "../utils/rtspBuilder.js";
import { logAudit } from "../utils/auditLogger.js";

export const createCamera = async (req, res) => {
    try {
        let { name, url, username, password, ip_address, organization_id } = req.body;

        if (username !== undefined) username = username.trim();
        if (password !== undefined) password = password.trim();
        if (ip_address !== undefined) ip_address = ip_address.trim();

        if (!name || !organization_id) {
            return res.status(400).json({
                success: false,
                error: "name and organization_id are required"
            });
        }

        let finalUrl = url;

        if (process.env.NODE_ENV === "production") {
            if (!username || password === undefined || !ip_address) {
                return res.status(400).json({
                    success: false,
                    error: "username, password and ip_address are required in production"
                });
            }

            if (!ip_address.match(/^\d+\.\d+\.\d+\.\d+(:\d+)?$/)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid IP address format"
                });
            }

            const ipWithPort = ip_address.includes(":")
                ? ip_address
                : `${ip_address}:554`;

            finalUrl = buildRtspUrl({
                username,
                password: encodeURIComponent(password ?? ""),
                ip: ipWithPort
            });
        }

        if (process.env.NODE_ENV !== "production" && !url) {
            return res.status(400).json({
                success: false,
                error: "url is required in development"
            });
        }

        const camera = await cameraService.createCamera({
            name,
            url: finalUrl,
            organizationId: organization_id
        });

        await logAudit({
            userId: req.user.id,
            action: "CAMERA_CREATED",
            module: "Camera Mgmt",
            entityType: "Camera",
            objectAffected: camera.id,
            newValue: camera.toJSON(),
            status: "Success",
            remarks: `Camera ${camera.name} created`,
            req,
        }).catch(() => {});

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
        let { name, url, username, password, ip_address } = req.body;

        if (username !== undefined) username = username.trim();
        if (password !== undefined) password = password.trim();
        if (ip_address !== undefined) ip_address = ip_address.trim();

        if (!organization_id) {
            return res.status(400).json({ success: false, error: "organization_id is required" });
        }

        const existingCamera = await cameraService.getCameraById(id, organization_id);
        if (!existingCamera) {
            return res.status(404).json({ success: false, error: "Camera not found or access denied" });
        }
        const oldCameraData = existingCamera.toJSON();

        let finalUrl = undefined;

        if (process.env.NODE_ENV === "production") {
            if (
                username !== undefined &&
                password !== undefined &&
                ip_address !== undefined
            ) {
                if (!ip_address.match(/^\d+\.\d+\.\d+\.\d+(:\d+)?$/)) {
                    return res.status(400).json({
                        success: false,
                        error: "Invalid IP address format"
                    });
                }

                const ipWithPort = ip_address.includes(":")
                    ? ip_address
                    : `${ip_address}:554`;

                finalUrl = buildRtspUrl({
                    username,
                    password: encodeURIComponent(password ?? ""),
                    ip: ipWithPort
                });
            }
        } else {
            if (url) {
                finalUrl = url;
            }
        }

        const camera = await cameraService.updateCamera(
            id,
            {
                name,
                ...(finalUrl !== undefined && { url: finalUrl })
            },
            organization_id
        );

        if (!camera) {
            return res.status(404).json({ success: false, error: "Camera not found or access denied" });
        }

        await logAudit({
            userId: req.user.id,
            action: "CAMERA_UPDATED",
            module: "Camera Mgmt",
            entityType: "Camera",
            objectAffected: camera.id,
            oldValue: oldCameraData,
            newValue: camera.toJSON(),
            status: "Success",
            remarks: `Camera ${camera.name} updated`,
            req,
        }).catch(() => {});

        res.json({ success: true, camera });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export const updateCameraSettings = async (req, res) => {
    try {
        const { id } = req.params;
        const { organization_id } = req.query;
        const settings = req.body;

        if (!organization_id) {
            return res.status(400).json({ success: false, error: "organization_id is required" });
        }

        const camera = await cameraService.updateCameraSettings(id, settings, organization_id);

        if (!camera) {
            return res.status(404).json({ success: false, message: "Camera not found or access denied" });
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

        const camera = await cameraService.getCameraById(id, organization_id);
        if (!camera) {
            return res.status(404).json({ success: false, message: "Camera not found or access denied" });
        }

        await cameraService.deleteCamera(id, organization_id);

        await logAudit({
            userId: req.user.id,
            action: "CAMERA_DELETED",
            module: "Camera Mgmt",
            entityType: "Camera",
            objectAffected: camera.id,
            status: "Success",
            remarks: `Camera ${camera.name} deleted`,
            req,
        }).catch(() => {});

        res.json({ success: true, message: "Camera deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};