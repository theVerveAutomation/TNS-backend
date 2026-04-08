import {
  getDashboardSummaryService,
  getDetectionsByTypeService,
  getHourlyTrendService,
  getCameraStatusService, 
} from "../services/analytics.service.js";

export const getDashboardSummary = async (req, res) => {
  try {
    const data = await getDashboardSummaryService();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch dashboard summary" });
  }
};

export const getDetectionsByType = async (req, res) => {
  try {
    const data = await getDetectionsByTypeService();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch detection types" });
  }
};

export const getHourlyTrend = async (req, res) => {
  try {
    const data = await getHourlyTrendService();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch hourly trend" });
  }
};

export const getCameraStatus = async (req, res) => {
  try {
    const data = await getCameraStatusService();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch camera status" });
  }
};