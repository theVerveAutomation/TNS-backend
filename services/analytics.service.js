import { Op } from "sequelize";
import sequelize from "../config/db.js";
import { Alert } from "../models/Alert.js";
import { Camera } from "../models/Camera.js";

// =============================================================================
// Dashboard Summary
// =============================================================================

export const getDashboardSummaryService = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  // ── Cameras ────────────────────────────────────────────────────────────────
  const totalCameras = await Camera.count();

  const onlineCameras = await Camera.count({
    where: { status: "normal" },
  });

  // ── Alerts TODAY ───────────────────────────────────────────────────────────
  const fallToday = await Alert.count({
    where: {
      eventType: { [Op.iLike]: "fall" },
      created_at: { [Op.gte]: todayStart },
    },
  });

  const tussleToday = await Alert.count({
    where: {
      eventType: { [Op.iLike]: "tussle" },
      created_at: { [Op.gte]: todayStart },
    },
  });

  // ── Alerts YESTERDAY ───────────────────────────────────────────────────────
  const fallYesterday = await Alert.count({
    where: {
      eventType: { [Op.iLike]: "fall" },
      created_at: {
        [Op.gte]: yesterdayStart,
        [Op.lt]: todayStart,
      },
    },
  });

  const tussleYesterday = await Alert.count({
    where: {
      eventType: { [Op.iLike]: "tussle" },
      created_at: {
        [Op.gte]: yesterdayStart,
        [Op.lt]: todayStart,
      },
    },
  });

  // ── Changes + Trends ───────────────────────────────────────────────────────
  const fallDiff = fallToday - fallYesterday;
  const tussleDiff = tussleToday - tussleYesterday;

  const fallChange = Math.abs(fallDiff);
  const tussleChange = Math.abs(tussleDiff);

  const fallTrend = fallDiff >= 0 ? "up" : "down";
  const tussleTrend = tussleDiff >= 0 ? "up" : "down";

  // ── System Health ──────────────────────────────────────────────────────────
  const systemHealth =
    totalCameras === 0
      ? 0
      : Math.round((onlineCameras / totalCameras) * 100);

  // ── Final Response ─────────────────────────────────────────────────────────
  return {
    totalCameras,
    onlineCameras,
    fallToday,
    fallChange,
    fallTrend,
    tussleToday,
    tussleChange,
    tussleTrend,
    systemHealth,
  };
};

// =============================================================================
// Detections by Type  (Pie chart)
// =============================================================================

export const getDetectionsByTypeService = async () => {
  const result = await Alert.findAll({
    attributes: [
      "eventType",
      [sequelize.fn("COUNT", sequelize.col("event_type")), "count"],
    ],
    where: {
      created_at: { [Op.gte]: todayStart },
    },
    group: ["event_type"],
    raw: true,
  });

  return result.map((item) => ({
    type: item.eventType.toLowerCase(),
    count: Number(item.count),
  }));
};

// =============================================================================
// Hourly Detection Trend  (Bar chart)
// =============================================================================

export const getHourlyTrendService = async () => {
  const result = await Alert.findAll({
    attributes: [
      [sequelize.fn("DATE_TRUNC", "hour", sequelize.col("created_at")), "hour"],
      "eventType",
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    where: {
      created_at: { [Op.gte]: todayStart },
    },
    group: ["hour", "event_type"],
    order: [[sequelize.literal("hour"), "ASC"]],
    raw: true,
  });

  const map = {};
  for (let i = 0; i < 24; i++) {
    const label = i.toString().padStart(2, "0") + ":00";
    map[label] = { hour: label, fall: 0, tussle: 0 };
  }

  result.forEach((row) => {
    const label =
      new Date(row.hour).getHours().toString().padStart(2, "0") + ":00";

    const type = row.eventType.toLowerCase();
    if (type === "fall" || type === "tussle") {
      map[label][type] = Number(row.count);
    }
  });

  return Object.values(map);
};

export const getCameraStatusService = async () => {
  const cameras = await Camera.findAll({
    attributes: ["id", "name", "status"],
    raw: true,
  });

  const alerts = await Alert.findAll({
    attributes: [
      "cameraId",
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    group: ["cameraId"],
    raw: true,
  });

  const alertMap = {};
  alerts.forEach((a) => {
    alertMap[a.cameraId] = Number(a.count);
  });

  return cameras.map((cam) => ({
    id: cam.id,
    name: cam.name,
    status: cam.status === "normal" ? "online" : "offline",
    detections: alertMap[cam.id] || 0,
  }));
};