import { Op } from "sequelize";
import { Alert } from "../models/Alert.js";
import { Camera } from "../models/Camera.js";
import { sendAlertNotification } from "../services/notification.service.js";

export const createAlert = async (data) => {
    const alert = await Alert.create(data);

    // 🔔 Trigger OS notification
    sendAlertNotification(alert);

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
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24 hours

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