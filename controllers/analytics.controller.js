import {
    getDashboardSummaryService,
    getDetectionsByTypeService,
    getHourlyTrendService,
    getCameraStatusService,
} from "../services/analytics.service.js";
import sequelize from "../config/db.js";

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

export const getMetrics = async (req, res) => {
    try {
        const { start, end } = req.query;

        let dateFilter = "";

        if (start && end) {
            dateFilter = `WHERE created_at BETWEEN '${start}' AND '${end}'`;
        }

        const [detectionsResult] = await sequelize.query(`
      SELECT COUNT(*)::int AS count 
      FROM alerts
      ${dateFilter}
    `);

        const [camerasResult] = await sequelize.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'normal')::int AS active,
        COUNT(*)::int AS total
      FROM cameras
    `);

        res.json({
            totalDetections: detectionsResult[0].count,
            totalAlerts: detectionsResult[0].count,
            cameras: {
                active: camerasResult[0].active,
                total: camerasResult[0].total,
            },
        });

    } catch (error) {
        console.error("Metrics error:", error);
        res.status(500).json({ message: "Failed to fetch metrics" });
    }
};

export const getDetectionTrends = async (req, res) => {
    try {
        const { start, end } = req.query;

        let dateFilter = "";
        if (start && end) {
            dateFilter = `WHERE created_at BETWEEN '${start}' AND '${end}'`;
        }

        const [results] = await sequelize.query(`
  SELECT 
    DATE(created_at AT TIME ZONE 'Asia/Colombo') AS date,
    COALESCE(COUNT(*) FILTER (WHERE LOWER(alert_type) = 'fall'), 0)::int AS fall,
    COALESCE(COUNT(*) FILTER (WHERE LOWER(alert_type) = 'tussle'), 0)::int AS tussle
  FROM alerts
  WHERE created_at BETWEEN '${start}' AND '${end}'
  GROUP BY DATE(created_at AT TIME ZONE 'Asia/Colombo')
  ORDER BY DATE(created_at AT TIME ZONE 'Asia/Colombo')
`);

        res.json(results);

    } catch (error) {
        console.error("Detection trends error:", error);
        res.status(500).json({ message: "Failed to fetch detection trends" });
    }
};