import * as alertService from "../services/alert.service.js";
import { Alert } from "../models/Alert.js";
import { User } from "../models/User.js";

export const createAlert = async (req, res) => {
    console.log("📥 Incoming Alert from Worker:", req.body);

    try {
        if (!req.body.eventType && !req.body.alertType) {
            console.error("❌ Validation Error: eventType/alertType is missing in payload");
            return res.status(400).json({
                success: false,
                message: "eventType is required"
            });
        }

        // Accept both `eventType` (new) and `alertType` (legacy)
        if (req.body.alertType && !req.body.eventType) req.body.eventType = req.body.alertType;
        // Map snapshotUrl/videoUrl to new snapshotPath/videoPath if provided
        if (req.body.snapshotUrl && !req.body.snapshotPath) req.body.snapshotPath = req.body.snapshotUrl;
        if (req.body.videoUrl && !req.body.videoPath) req.body.videoPath = req.body.videoUrl;

        const alert = await alertService.createAlert(req.body);

        console.log("✅ Alert successfully saved to DB:", alert.id);
        res.status(201).json({ success: true, alert });
    } catch (err) {
        console.error("❌ Database/Service Error:", err.message);
        res.status(500).json({
            success: false,
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : {}
        });
    }
};

export const getAllAlerts = async (req, res) => {
    try {
        const alerts = await alertService.getAllAlerts();
        res.json({ success: true, alerts });
    } catch (err) {
        console.error("❌ Error fetching alerts:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getAlertById = async (req, res) => {
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

export const updateAlert = async (req, res) => {
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

export const deleteAlert = async (req, res) => {
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

export const getRecentAlerts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const alerts = await alertService.getRecentAlerts({ limit });

        res.json(alerts);
    } catch (err) {
        console.error("❌ Error fetching recent alerts:", err.message);
        res.status(500).json({ message: err.message });
    }
};

export const reviewAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const { accuracy, notes } = req.body;

    const alert = await Alert.findByPk(id);
    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    const now = new Date();

    // 🔹 calculate response time
    const responseTime = Math.floor(
      (now - new Date(alert.createdAt)) / 60000
    );

    // 🔹 update alert
    await alert.update({
      isReviewed: true,
      validationStatus: accuracy === "valid" ? "Valid" : "False Alarm",
      actionTaken: notes,
      acknowledgedBy: req.user.id, // ✅ FIXED: UUID instead of username
      responseTimeMin: responseTime,
      status: "Closed",
    });

    res.json({ success: true, message: "Alert reviewed successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error reviewing alert" });
  }
};

export const getEventLogs = async (req, res) => {
  try {
    // ✅ FIXED: include both id and username from User
    const logs = await Alert.findAll({
      where: {
        isReviewed: true
      },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id", "username"]
        }
      ]
    });

    res.json({ logs });

  } catch (err) {
    res.status(500).json({ message: "Error fetching event logs" });
  }
};