const express = require("express");
const {
  getDashboardSummary,
  getDetectionsByType,
  getHourlyTrend,
  getCameraStatus,
  getMetrics,
  getDetectionTrends,
  getHourlyActivity,
  getComparison,
  getCameraPerformance,
  getVideoAnalyticsSummary,
  getTodaySummaryController,
  getAlertsBySeverity,
  } = require("../controllers/analytics.controller.js");
  const { protect } = require("../middleware/auth.middleware.js");

const router = express.Router();                              

router.get("/summary", getDashboardSummary);
router.get("/detections-by-type", getDetectionsByType);
router.get("/hourly-trend", getHourlyTrend);
router.get("/camera-status", getCameraStatus);
router.get("/metrics", getMetrics);
router.get("/detection-trends", getDetectionTrends);
router.get("/hourly-activity", getHourlyActivity);
router.get("/comparison", getComparison);
router.get("/camera-performance", getCameraPerformance);
router.get("/video-summary", getVideoAnalyticsSummary);
router.get("/today-summary", protect, getTodaySummaryController);
router.get("/alerts-by-severity", getAlertsBySeverity);

module.exports = router;