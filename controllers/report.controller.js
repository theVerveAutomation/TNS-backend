import { 
  getDailyReportData,
  getWeeklyReportData,
  getMonthlyPerformanceReportData,
  getMonthlyAccountReportData
} from "../services/report.service.js";

/* =========================================================
   📊 DAILY REPORT CONTROLLER
   Query params: severity, date (YYYY-MM-DD)
========================================================= */
export const getDailyReport = async (req, res) => {
  try {
    const severity  = req.query.severity ?? "all";
    const dateParam = req.query.date     ?? null;
    const data = await getDailyReportData(severity, dateParam);
    res.status(200).json(data);
  } catch (error) {
    console.error("Daily report controller error:", error);
    res.status(500).json({ message: "Failed to fetch daily report" });
  }
};

/* =========================================================
   📊 WEEKLY REPORT CONTROLLER
   Query params: severity, week_start (YYYY-MM-DD)
========================================================= */
export const getWeeklyReport = async (req, res) => {
  try {
    const severity       = req.query.severity   ?? "all";
    const weekStartParam = req.query.week_start ?? null;
    const data = await getWeeklyReportData(severity, weekStartParam);
    res.json(data);
  } catch (error) {
    console.error("Weekly report error:", error);
    res.status(500).json({ message: "Failed weekly report" });
  }
};

/* =========================================================
   📊 MONTHLY PERFORMANCE REPORT CONTROLLER
   Query params: severity, month (YYYY-MM-DD, last day of month)
========================================================= */
export const getMonthlyReport = async (req, res) => {
  try {
    const severity   = req.query.severity ?? "all";
    const monthParam = req.query.month    ?? null;
    const data = await getMonthlyPerformanceReportData(severity, monthParam);
    res.json(data);
  } catch (error) {
    console.error("Monthly report error:", error);
    res.status(500).json({ message: "Failed monthly report" });
  }
};

/* =========================================================
   📊 MONTHLY ACCOUNT REPORT CONTROLLER
   Query params: month (YYYY-MM-DD, last day of month)
========================================================= */
export const getMonthlyAccountReport = async (req, res) => {
  try {
    const monthParam = req.query.month ?? null;
    const data = await getMonthlyAccountReportData(monthParam);
    res.json(data);
  } catch (error) {
    console.error("Monthly account report error:", error);
    res.status(500).json({ message: "Failed to fetch monthly account report" });
  }
};