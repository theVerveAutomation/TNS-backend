import { Op } from "sequelize";
import { Alert } from "../models/Alert.js";
import { AlertSchedule } from "../models/AlertSchedule.js";
import { Camera } from "../models/Camera.js";
import { isWithinSchedule } from "../utils/scheduleChecker.js";
import { sendAlertNotification } from "../services/notification.service.js";

export const createAlert = async (data) => {

    const camera = await Camera.findByPk(data.cameraId);

    if (!camera) {
        throw new Error("Camera not found");
    }

    // ✅ Convert cam1 → UUID
    data.cameraId = camera.id;

    console.log("📷 Camera:", camera);

    const schedule = await AlertSchedule.findOne({
        where: { organizationId: camera.organizationId },
    });

    console.log("🧠 Schedule from DB:", schedule);

    const allowed = isWithinSchedule(schedule);

    console.log("⏱ Schedule check result:", allowed);

    if (!allowed) {
        console.log("⛔ Alert blocked at service level");
        return null;
    }

    const alert = await Alert.create(data);

    await sendAlertNotification(alert);

    return alert;
};

export const getAllAlerts = async () => {
    return await Alert.findAll();
};

export const getAlertById = async (id) => {
    return await Alert.findByPk(id);
};

export const updateAlert = async (id, data) => {
    const alert = await Alert.findByPk(id);
    if (!alert) return null;
    await alert.update(data);
    return alert;
};

export const deleteAlert = async (id) => {
    const alert = await Alert.findByPk(id);
    if (!alert) return false;
    await alert.destroy();
    return true;
};

export const getRecentAlerts = async ({ limit = 10 }) => {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return await Alert.findAll({
        where: {
            created_at: {
                [Op.gte]: since,
            },
        },
        limit: parseInt(limit),
        order: [["created_at", "DESC"]],
        include: [
            {
                model: Camera,
                attributes: ["name"],
            },
        ],
    });
};