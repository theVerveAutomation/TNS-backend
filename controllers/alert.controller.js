import * as alertService from "../services/alert.service.js";

export const createAlert = async (req, res) => {
    console.log("📥 Incoming Alert from Worker:", req.body);

    try {
        if (!req.body.alertType) {
            console.error("❌ Validation Error: alertType is missing in payload");
            return res.status(400).json({ 
                success: false, 
                message: "alertType is required" 
            });
        }

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