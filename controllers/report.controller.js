import { getDailyReportData } from "../services/report.service.js";

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