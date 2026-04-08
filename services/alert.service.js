import { Alert } from "../models/Alert.js";
import { Camera } from "../models/Camera.js";

export const createAlert = async (data) => {
    return await Alert.create(data);
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
  return await Alert.findAll({
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
