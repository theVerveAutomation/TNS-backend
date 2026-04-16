import { Op, fn, col } from "sequelize";
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
      alertType: { [Op.iLike]: "fall" },
      created_at: { [Op.gte]: todayStart },
    },
  });

  const tussleToday = await Alert.count({
    where: {
      alertType: { [Op.iLike]: "tussle" },
      created_at: { [Op.gte]: todayStart },
    },
  });

  // ── Alerts YESTERDAY ───────────────────────────────────────────────────────
  const fallYesterday = await Alert.count({
    where: {
      alertType: { [Op.iLike]: "fall" },
      created_at: {
        [Op.gte]: yesterdayStart,
        [Op.lt]: todayStart,
      },
    },
  });

  const tussleYesterday = await Alert.count({
    where: {
      alertType: { [Op.iLike]: "tussle" },
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
// Detections by Type  (Pie chart) — filtered to TODAY only
// =============================================================================

export const getDetectionsByTypeService = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const result = await Alert.findAll({
    attributes: [
      "alertType",
      [sequelize.fn("COUNT", sequelize.col("alert_type")), "count"],
    ],
    where: {
      created_at: { [Op.gte]: todayStart },
    },
    group: ["alert_type"],
    raw: true,
  });

  return result.map((item) => ({
    type: item.alertType.toLowerCase(),
    count: Number(item.count),
  }));
};

// =============================================================================
// Hourly Detection Trend  (Bar chart) — filtered to TODAY only
// =============================================================================

export const getHourlyTrendService = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const result = await Alert.findAll({
    attributes: [
      [sequelize.fn("DATE_TRUNC", "hour", sequelize.col("created_at")), "hour"],
      "alertType",
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    where: {
      created_at: { [Op.gte]: todayStart },
    },
    group: ["hour", "alert_type"],
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

    const type = row.alertType.toLowerCase();
    if (type === "fall" || type === "tussle") {
      map[label][type] = Number(row.count);
    }
  });

  return Object.values(map);
};

// =============================================================================
// Camera Status
// =============================================================================

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

// =============================================================================
// Today's Summary  (Video Analytics — Summary card)
// =============================================================================

export const getTodaySummary = async () => {
  // 🕒 Get today's range
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // ── Total events ───────────────────────────────────────────────────────────
  const totalEvents = await Alert.count({
    where: {
      created_at: {
        [Op.between]: [startOfDay, endOfDay],
      },
    },
  });

  // ── Critical alerts ────────────────────────────────────────────────────────
  const criticalAlerts = await Alert.count({
    where: {
      severity: "Critical",
      created_at: {
        [Op.between]: [startOfDay, endOfDay],
      },
    },
  });

  // ── Avg response time (ignore nulls) ───────────────────────────────────────
  const avgResponse = await Alert.findOne({
    attributes: [
      [fn("AVG", col("response_time_min")), "avgResponse"],
    ],
    where: {
      response_time_min: {
        [Op.ne]: null,
      },
      created_at: {
        [Op.between]: [startOfDay, endOfDay],
      },
    },
    raw: true,
  });

  const avgResponseTime = avgResponse?.avgResponse
    ? parseFloat(avgResponse.avgResponse)
    : 0;

  // ── Accuracy ───────────────────────────────────────────────────────────────
  const validCount = await Alert.count({
    where: {
      validation_status: "Valid",
      created_at: {
        [Op.between]: [startOfDay, endOfDay],
      },
    },
  });

  const falseCount = await Alert.count({
    where: {
      validation_status: "False Alarm",
      created_at: {
        [Op.between]: [startOfDay, endOfDay],
      },
    },
  });

  const totalVerified = validCount + falseCount;

  const accuracy =
    totalVerified > 0
      ? (validCount / totalVerified) * 100
      : 0;

  return {
    total_events: totalEvents,
    critical_alerts: criticalAlerts,
    avg_response_time: Number(avgResponseTime.toFixed(2)),
    accuracy: Number(accuracy.toFixed(2)),
  };
};