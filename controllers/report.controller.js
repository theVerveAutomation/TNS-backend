import { 
  getDailyReportData,
  getWeeklyReportData,
  getMonthlyPerformanceReportData,
  getMonthlyAccountReportData
} from "../services/report.service.js";

/* =========================================================
   📊 DAILY REPORT CONTROLLER
   Handles HTTP request for Daily Detection Summary
========================================================= */
export const getDailyReport = async (req, res) => {
  try {
    const severity = req.query.severity ?? "all";
    const data = await getDailyReportData(severity);
    res.status(200).json(data);
  } catch (error) {
    console.error("Daily report controller error:", error);
    res.status(500).json({ message: "Failed to fetch daily report" });
  }
};

/* =========================================================
   📊 WEEKLY REPORT CONTROLLER
========================================================= */
export const getWeeklyReport = async (req, res) => {
  try {
    const severity = req.query.severity ?? "all";
    const data = await getWeeklyReportData(severity);
    res.json(data);
  } catch (error) {
    console.error("Weekly report error:", error);
    res.status(500).json({ message: "Failed weekly report" });
  }
};

/* =========================================================
   📊 MONTHLY PERFORMANCE REPORT CONTROLLER
========================================================= */
export const getMonthlyReport = async (req, res) => {
  try {
    const severity = req.query.severity ?? "all";
    const data = await getMonthlyPerformanceReportData(severity);
    res.json(data);
  } catch (error) {
    console.error("Monthly report error:", error);
    res.status(500).json({ message: "Failed monthly report" });
  }
};

/* =========================================================
   📊 MONTHLY ACCOUNT REPORT CONTROLLER
========================================================= */
export const getMonthlyAccountReport = async (req, res) => {
  try {
    const severity = req.query.severity ?? "all";
    const data = await getMonthlyAccountReportData(severity);
    res.json(data);
  } catch (error) {
    console.error("Monthly account report error:", error);
    res.status(500).json({ message: "Failed to fetch monthly account report" });
  }
};