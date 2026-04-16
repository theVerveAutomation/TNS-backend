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
    const data = await getDailyReportData();

    res.status(200).json(data);

  } catch (error) {
    console.error("Daily report controller error:", error);
    res.status(500).json({
      message: "Failed to fetch daily report"
    });
  }
};

export const getWeeklyReport = async (req, res) => {
  try {
    const data = await getWeeklyReportData();
    res.json(data);
  } catch (error) {
    console.error("Weekly report error:", error);
    res.status(500).json({ message: "Failed weekly report" });
  }
};

export const getMonthlyReport = async (req, res) => {
  try {
    const data = await getMonthlyPerformanceReportData();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed monthly report" });
  }
};

/* =========================================================
   📊 MONTHLY ACCOUNT REPORT CONTROLLER
========================================================= */
export const getMonthlyAccountReport = async (req, res) => {
  try {
    const data = await getMonthlyAccountReportData();
    res.json(data);
  } catch (error) {
    console.error("Monthly account report error:", error);
    res.status(500).json({
      message: "Failed to fetch monthly account report"
    });
  }
};