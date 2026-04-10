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

export const getHourlyActivity = async (req, res) => {
  try {
    const { start, end } = req.query;

    const [results] = await sequelize.query(`
      WITH hours AS (
        SELECT generate_series(0, 23) AS h
      )
      SELECT 
        LPAD(hours.h::text, 2, '0') || ':00' AS hour,
        COALESCE(COUNT(a.id), 0)::int AS activity
      FROM hours
      LEFT JOIN alerts a
        ON EXTRACT(HOUR FROM a.created_at AT TIME ZONE 'Asia/Colombo') = hours.h
        AND a.created_at BETWEEN '${start}' AND '${end}'
      GROUP BY hours.h
      ORDER BY hours.h
    `);

    res.json(results);

  } catch (error) {
    console.error("Hourly error:", error);
    res.status(500).json({ message: "Failed to fetch hourly data" });
  }
};

export const getComparison = async (req, res) => {
  try {
    const { start, end } = req.query;

    // 1️⃣ Find earliest data
    const [minResult] = await sequelize.query(`
      SELECT MIN(created_at) AS first_record FROM alerts
    `);

    const firstDate = new Date(minResult[0].first_record);
    const now = new Date();

    const hasOneYearData =
      (now - firstDate) >= 365 * 24 * 60 * 60 * 1000;

    // 🧠 2️⃣ Decide mode
    let mode = hasOneYearData ? "yearly" : "weekly";

    let data = [];

    // =========================
    // 🟢 WEEK-OVER-WEEK (NOW)
    // =========================
    if (mode === "weekly") {
      const [weeklyData] = await sequelize.query(`
        WITH days AS (
          SELECT generate_series(0, 6) AS d
        )
        SELECT 
          TO_CHAR(
            (CURRENT_DATE - INTERVAL '6 days' + (d || ' days')::interval),
            'Dy'
          ) AS label,

          -- This week
          COALESCE((
            SELECT COUNT(*)
            FROM alerts
            WHERE DATE(created_at AT TIME ZONE 'Asia/Colombo') =
                  CURRENT_DATE - INTERVAL '6 days' + (d || ' days')::interval
          ), 0)::int AS this_period,

          -- Last week
          COALESCE((
            SELECT COUNT(*)
            FROM alerts
            WHERE DATE(created_at AT TIME ZONE 'Asia/Colombo') =
                  CURRENT_DATE - INTERVAL '13 days' + (d || ' days')::interval
          ), 0)::int AS last_period

        FROM days
        ORDER BY d
      `);

      data = weeklyData;
    }

    // =========================
    // 🔵 YEAR-OVER-YEAR (LATER)
    // =========================
    if (mode === "yearly") {
      const [yearlyData] = await sequelize.query(`
        SELECT 
          TO_CHAR(created_at AT TIME ZONE 'Asia/Colombo', 'Mon') AS label,

          COUNT(*) FILTER (
            WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
          )::int AS this_period,

          COUNT(*) FILTER (
            WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE) - 1
          )::int AS last_period

        FROM alerts
        WHERE created_at BETWEEN '${start}' AND '${end}'
        GROUP BY label
        ORDER BY MIN(created_at)
      `);

      data = yearlyData;
    }

    // 3️⃣ Response
    res.json({
      mode,
      data,
    });

  } catch (error) {
    console.error("Comparison error:", error);
    res.status(500).json({ message: "Failed to fetch comparison" });
  }
};

export const getCameraPerformance = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        c.id,
        c.name AS camera,
        c.status,
        COUNT(a.id)::int AS detections
      FROM cameras c
      LEFT JOIN alerts a 
        ON a.camera_id = c.id
      GROUP BY c.id
      ORDER BY c.name
    `);

    // format response for frontend
    const formatted = results.map(row => ({
      camera: row.camera,
      uptime: row.status === "normal" ? 100 : 0, // temp logic
      detections: row.detections,
      alerts: row.detections, // same for now
      status: row.status
    }));

    res.json(formatted);

  } catch (error) {
    console.error("Camera performance error:", error);
    res.status(500).json({ message: "Failed to fetch camera performance" });
  }
};