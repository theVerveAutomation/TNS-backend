import * as alertService from "../services/alert.service.js";

export const createAlert = async (req, res) => {
    try {
        const alert = await alertService.createAlert(req.body);
        res.status(201).json({ success: true, alert });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getAllAlerts = async (req, res) => {
    try {
        const alerts = await alertService.getAllAlerts();
        res.json({ success: true, alerts });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getAlertById = async (req, res) => {
    try {
        const alert = await alertService.getAlertById(req.params.id);
        if (!alert) return res.status(404).json({ success: false, message: "Alert not found" });
        res.json({ success: true, alert });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateAlert = async (req, res) => {
    try {
        const alert = await alertService.updateAlert(req.params.id, req.body);
        if (!alert) return res.status(404).json({ success: false, message: "Alert not found" });
        res.json({ success: true, alert });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteAlert = async (req, res) => {
    try {
        const result = await alertService.deleteAlert(req.params.id);
        if (!result) return res.status(404).json({ success: false, message: "Alert not found" });
        res.json({ success: true, message: "Alert deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
