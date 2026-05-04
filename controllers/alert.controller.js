const alertService = require("../services/alert.service.js");
const { Alert } = require("../models/Alert.js");
const { User } = require("../models/User.js");
const { Camera } = require("../models/Camera.js");
const { logAudit } = require("../utils/auditLogger.js");

const createAlert = async (req, res) => {
    console.log("📥 Incoming Alert from Worker:", req.body);

    try {
        if (!req.body.eventType && !req.body.alertType) {
            console.error("❌ Validation Error: eventType/alertType is missing in payload");
            return res.status(400).json({
                success: false,
                message: "eventType is required"
            });
        }

        // Normalise field aliases sent by different workers
        if (req.body.alertType && !req.body.eventType) req.body.eventType = req.body.alertType;
        if (req.body.eventType && !req.body.alertType) req.body.alertType = req.body.eventType;

        // Python worker sends "imagePath" — map it to snapshotPath
        if (req.body.imagePath && !req.body.snapshotPath) req.body.snapshotPath = req.body.imagePath;

        if (req.body.snapshotUrl && !req.body.snapshotPath) req.body.snapshotPath = req.body.snapshotUrl;
        if (req.body.videoUrl && !req.body.videoPath) req.body.videoPath = req.body.videoUrl;

        console.log("📸 Resolved snapshotPath:", req.body.snapshotPath);

        const alert = await alertService.createAlert(req.body);

        // 🚫 Blocked by schedule at service level
        if (!alert) {
            return res.status(200).json({
                success: false,
                message: "Blocked by schedule",
            });
        }

        await logAudit({
            action: "ALERT_CREATED",
            module: "Alert Mgmt",
            entityType: "Alert",
            objectAffected: alert.id,
            metadata: { type: alert.alertType },
            newValue: {
                type: alert.alertType,
                severity: alert.severity,
                status: alert.status,
            },
            status: "Success",
            remarks: `Alert created (${alert.alertType})`,
        }).catch(() => { });

        console.log("✅ Alert successfully saved to DB:", alert.id);
        res.status(201).json({ success: true, alert });
    } catch (err) {
        console.error("❌ Database/Service Error:", err.message);
        res.status(500).json({
            success: false,
            message: err.message,
            stack: process.env.NODE_ENV === "development" ? err.stack : {}
        });
    }
};

const getAllAlerts = async (req, res) => {
    try {
        const alerts = await Alert.findAll({
            include: [
                {
                    model: Camera,
                    attributes: ["id", "name"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });
        res.json({ success: true, alerts });
    } catch (err) {
        console.error("❌ Error fetching alerts:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

const getAlertById = async (req, res) => {
    try {
        const alert = await alertService.getAlertById(req.params.id);
        if (!alert) {
            return res.status(404).json({ success: false, message: "Alert not found" });
        }
        res.json({ success: true, alert });
    } catch (err) {
        console.error("❌ Error fetching alert by ID:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateAlert = async (req, res) => {
    try {
        const alert = await alertService.updateAlert(req.params.id, req.body);
        if (!alert) {
            return res.status(404).json({ success: false, message: "Alert not found" });
        }
        res.json({ success: true, alert });
    } catch (err) {
        console.error("❌ Error updating alert:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

const deleteAlert = async (req, res) => {
    try {
        const result = await alertService.deleteAlert(req.params.id);
        if (!result) {
            return res.status(404).json({ success: false, message: "Alert not found" });
        }
        res.json({ success: true, message: "Alert deleted" });
    } catch (err) {
        console.error("❌ Error deleting alert:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

const getRecentAlerts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const alerts = await alertService.getRecentAlerts({ limit });
        res.json(alerts);
    } catch (err) {
        console.error("❌ Error fetching recent alerts:", err.message);
        res.status(500).json({ message: err.message });
    }
};

const reviewAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const { accuracy, notes } = req.body;

        const alert = await Alert.findByPk(id);
        if (!alert) {
            return res.status(404).json({ message: "Alert not found" });
        }

        const now = new Date();
        const responseTime = Math.floor(
            (now - new Date(alert.createdAt)) / 60000
        );

        const oldAlert = alert.toJSON();

        alert.isReviewed = true;
        alert.validationStatus = accuracy === "valid" ? "Valid" : "False Alarm";
        alert.actionTaken = notes;
        alert.acknowledgedBy = req.user.id;
        alert.responseTimeMin = responseTime;
        alert.status = "Closed";
        alert.validation = accuracy;
        await alert.save();

        await logAudit({
            userId: req.user.id,
            action: "ALERT_REVIEWED",
            module: "Alert Mgmt",
            entityType: "Alert",
            objectAffected: alert.id,
            oldValue: {
                status: oldAlert.status,
                validation: oldAlert.validation ?? null,
            },
            newValue: {
                status: alert.status,
                validation: alert.validation,
            },
            status: "Success",
            req,
        }).catch(() => { });

        res.json({ success: true, message: "Alert reviewed successfully" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error reviewing alert" });
    }
};

const getEventLogs = async (req, res) => {
    try {
        const logs = await Alert.findAll({
            where: { isReviewed: true },
            order: [["createdAt", "DESC"]],
            include: [
                {
                    model: User,
                    attributes: ["id", "username"],
                },
            ],
        });

        res.json({ logs });
    } catch (err) {
        res.status(500).json({ message: "Error fetching event logs" });
    }
};

module.exports = {
    createAlert,
    getAllAlerts,
    getAlertById,
    updateAlert,
    deleteAlert,
    getRecentAlerts,
    reviewAlert,
    getEventLogs,
};