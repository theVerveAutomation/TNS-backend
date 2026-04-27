import os from "os";
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

  // ── System Health (COMPOSITE) ──────────────────────────────────────────────

  // =======================
  // 1. VIDEO HEALTH (40%)
  // =======================

  const normalCameras = await Camera.count({
    where: { status: "normal" },
  });

  const warningCameras = await Camera.count({
    where: { status: "warning" },
  });

  const detectionEnabled = await Camera.count({
    where: { detection: true },
  });

  const availabilityScore =
    totalCameras === 0
      ? 0
      : (normalCameras / totalCameras) * 100;

  const stabilityScore =
    totalCameras === 0
      ? 0
      : ((normalCameras + warningCameras * 0.5) / totalCameras) * 100;

  const activityScore =
    totalCameras === 0
      ? 0
      : (detectionEnabled / totalCameras) * 100;

  const videoHealth = Math.round(
    availabilityScore * 0.5 +
    stabilityScore * 0.3 +
    activityScore * 0.2
  );

  // =======================
  // 2. SYSTEM RESOURCES (30%)
  // =======================

  const totalMem = os.totalmem();
  const freeMem = os.freemem();

  const memoryUsagePercent = (1 - freeMem / totalMem) * 100;
  const memoryHealth = Math.max(0, 100 - memoryUsagePercent);

  const cpuLoad = os.loadavg()[0];
  const cpuCores = os.cpus().length;

  const cpuUsagePercent = (cpuLoad / cpuCores) * 100;
  const cpuHealth = Math.max(0, 100 - cpuUsagePercent);

  const systemResourceHealth = Math.round(
    cpuHealth * 0.5 +
    memoryHealth * 0.5
  );

  // =======================
  // 3. ALERT RELIABILITY (30%)
  // =======================

  const totalAlerts = await Alert.count({
    where: { created_at: { [Op.gte]: todayStart } },
  });

  const processedAlerts = await Alert.count({
    where: {
      response_time_min: { [Op.ne]: null },
      created_at: { [Op.gte]: todayStart },
    },
  });

  const processingRate =
    totalAlerts === 0
      ? 100
      : (processedAlerts / totalAlerts) * 100;

  const falseAlerts = await Alert.count({
    where: {
      validation_status: "False Alarm",
      created_at: { [Op.gte]: todayStart },
    },
  });

  const falseRate =
    totalAlerts === 0
      ? 0
      : (falseAlerts / totalAlerts) * 100;

  const accuracyHealth = Math.max(0, 100 - falseRate);

  const avgResponse = await Alert.findOne({
    attributes: [[fn("AVG", col("response_time_min")), "avgResponse"]],
    where: {
      response_time_min: { [Op.ne]: null },
      created_at: { [Op.gte]: todayStart },
    },
    raw: true,
  });

  const avgResponseTime = avgResponse?.avgResponse
    ? parseFloat(avgResponse.avgResponse)
    : 0;

  const MAX_RESPONSE_TIME = 5;

  const responseHealth = Math.max(
    0,
    100 - (avgResponseTime / MAX_RESPONSE_TIME) * 100
  );

  const alertHealth = Math.round(
    processingRate * 0.4 +
    accuracyHealth * 0.3 +
    responseHealth * 0.3
  );

  // =======================
  // FINAL SYSTEM HEALTH
  // =======================

  const systemHealth = Math.round(
    videoHealth * 0.4 +
    systemResourceHealth * 0.3 +
    alertHealth * 0.3
  );

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
    systemHealthBreakdown: {
      videoHealth,
      systemResourceHealth,
      alertHealth,
    },
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

// =============================================================================
// Severity Pie chart
// =============================================================================
export const getAlertsBySeverityService = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const result = await Alert.findAll({
    attributes: [
      "severity",
      [sequelize.fn("COUNT", sequelize.col("id")), "count"],
    ],
    where: {
      created_at: { [Op.gte]: todayStart },
    },
    group: ["severity"],
    raw: true,
  });

  // 👉 Convert to map
  const map = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  result.forEach((item) => {
    const key = (item.severity || "medium").toLowerCase();
    map[key] = Number(item.count);
  });

  // 👉 Always return all 4
  return Object.keys(map).map((key) => ({
    severity: key,
    count: map[key],
  }));
};