import express from "express";
import {
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
  } from "../controllers/analytics.controller.js";
  import { protect } from "../middleware/auth.middleware.js";

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

export default router;