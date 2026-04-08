import express from "express";
import {
  getDashboardSummary,
  getDetectionsByType,
  getHourlyTrend,
  getCameraStatus,
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/summary", getDashboardSummary);
router.get("/detections-by-type", getDetectionsByType);
router.get("/hourly-trend", getHourlyTrend);
router.get("/camera-status", getCameraStatus);

export default router;