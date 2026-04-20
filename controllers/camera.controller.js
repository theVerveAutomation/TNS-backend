import * as cameraService from "../services/camera.service.js";
import { buildRtspUrl } from "../utils/rtspBuilder.js";

export const createCamera = async (req, res) => {
    try {
        let { name, url, username, password, ip_address, organization_id } = req.body;

        // ✅ Fix 1: Trim inputs to prevent spacing issues
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

        // ✅ Production mode → build URL from credentials
        if (process.env.NODE_ENV === "production") {
            if (!username || password === undefined || !ip_address) {
                return res.status(400).json({
                    success: false,
                    error: "username, password and ip_address are required in production"
                });
            }

            // ✅ Fix 2: Validate IP format
            if (!ip_address.match(/^\d+\.\d+\.\d+\.\d+(:\d+)?$/)) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid IP address format"
                });
            }

            const ipWithPort = ip_address.includes(":")
                ? ip_address
                : `${ip_address}:554`;

            // ✅ Fix 3: Encode password for special characters
            finalUrl = buildRtspUrl({
                username,
                password: encodeURIComponent(password ?? ""),
                ip: ipWithPort
            });
        }

        // ✅ Development mode → use raw URL
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

        // ✅ Fix 1: Trim inputs to prevent spacing issues
        if (username !== undefined) username = username.trim();
        if (password !== undefined) password = password.trim();
        if (ip_address !== undefined) ip_address = ip_address.trim();

        if (!organization_id) {
            return res.status(400).json({ success: false, error: "organization_id is required" });
        }

        let finalUrl = undefined;

        // ✅ Production mode → build URL if credentials provided
        if (process.env.NODE_ENV === "production") {
            // ✅ Fix 4: Better update condition — check all three are present
            if (
                username !== undefined &&
                password !== undefined &&
                ip_address !== undefined
            ) {
                // ✅ Fix 2: Validate IP format
                if (!ip_address.match(/^\d+\.\d+\.\d+\.\d+(:\d+)?$/)) {
                    return res.status(400).json({
                        success: false,
                        error: "Invalid IP address format"
                    });
                }

                const ipWithPort = ip_address.includes(":")
                    ? ip_address
                    : `${ip_address}:554`;

                // ✅ Fix 3: Encode password for special characters
                finalUrl = buildRtspUrl({
                    username,
                    password: encodeURIComponent(password ?? ""),
                    ip: ipWithPort
                });
            }
        } else {
            // ✅ Development mode → use raw URL only if explicitly provided
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