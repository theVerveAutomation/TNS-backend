const {
    getDashboardSummaryService,
    getDetectionsByTypeService,
    getHourlyTrendService,
    getCameraStatusService,
    getTodaySummary,
    getAlertsBySeverityService,
} = require("../services/analytics.service.js");
const sequelize = require("../config/db.js");
const { Camera } = require("../models/Camera.js");
const { Alert } = require("../models/Alert.js");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

// ───────────────────────────────
// Helpers: Folder Size
// ───────────────────────────────
const getFolderSize = (dirPath) => {
    let totalSize = 0;

    if (!fs.existsSync(dirPath)) return 0;

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            totalSize += getFolderSize(fullPath);
        } else {
            totalSize += stats.size;
        }
    }

    return totalSize;
};

const formatBytes = (bytes) => {
    if (bytes === 0) return "0 Bytes";

    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
};

// ───────────────────────────────
// Dashboard (legacy services)
// ───────────────────────────────
const getDashboardSummary = async (req, res) => {
    try {
        const data = await getDashboardSummaryService();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
};

const getDetectionsByType = async (req, res) => {
    try {
        const data = await getDetectionsByTypeService();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch detection types" });
    }
};

const getHourlyTrend = async (req, res) => {
    try {
        const data = await getHourlyTrendService();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch hourly trend" });
    }
};

const getCameraStatus = async (req, res) => {
    try {
        const data = await getCameraStatusService();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch camera status" });
    }
};

// ───────────────────────────────
// Metrics
// ───────────────────────────────
const getMetrics = async (req, res) => {
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

// ───────────────────────────────
// Detection Trends
// ───────────────────────────────
const getDetectionTrends = async (req, res) => {
    try {
        const { start, end } = req.query;

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

// ───────────────────────────────
// Hourly Activity
// ───────────────────────────────
const getHourlyActivity = async (req, res) => {
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

// ───────────────────────────────
// Comparison (Week-over-Week / Year-over-Year)
// ───────────────────────────────
const getComparison = async (req, res) => {
    try {
        const { start, end } = req.query;

        // Find earliest data
        const [minResult] = await sequelize.query(`
            SELECT MIN(created_at) AS first_record FROM alerts
        `);

        const firstDate = new Date(minResult[0].first_record);
        const now = new Date();

        const hasOneYearData =
            (now - firstDate) >= 365 * 24 * 60 * 60 * 1000;

        // Decide mode
        let mode = hasOneYearData ? "yearly" : "weekly";
        let data = [];

        // Week-over-week
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

                    COALESCE((
                        SELECT COUNT(*)
                        FROM alerts
                        WHERE DATE(created_at AT TIME ZONE 'Asia/Colombo') =
                              CURRENT_DATE - INTERVAL '6 days' + (d || ' days')::interval
                    ), 0)::int AS this_period,

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

        // Year-over-year
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

        res.json({ mode, data });

    } catch (error) {
        console.error("Comparison error:", error);
        res.status(500).json({ message: "Failed to fetch comparison" });
    }
};

// ───────────────────────────────
// Camera Performance
// ───────────────────────────────
const getCameraPerformance = async (req, res) => {
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

        const formatted = results.map(row => ({
            camera: row.camera,
            uptime: row.status === "normal" ? 100 : 0,
            detections: row.detections,
            alerts: row.detections,
            status: row.status,
        }));

        res.json(formatted);

    } catch (error) {
        console.error("Camera performance error:", error);
        res.status(500).json({ message: "Failed to fetch camera performance" });
    }
};

// ───────────────────────────────
// Video Analytics Summary
// ───────────────────────────────
const getVideoAnalyticsSummary = async (req, res, next) => {
    try {
        // 1. Cameras
        const cameras = await Camera.findAll();

        const totalCameras = cameras.length;
        const activeCameras = cameras.filter(
            (c) => c.status === "normal"
        ).length;

        // 2. Alerts (Today vs Yesterday)
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);

        const todayAlerts = await Alert.count({
            where: {
                createdAt: { [Op.gte]: startOfToday },
            },
        });

        const yesterdayAlerts = await Alert.count({
            where: {
                createdAt: {
                    [Op.gte]: startOfYesterday,
                    [Op.lt]: startOfToday,
                },
            },
        });

        const alertChange = todayAlerts - yesterdayAlerts;

        // 3. Active Events (last 10 mins)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        const recentAlerts = await Alert.findAll({
            where: {
                createdAt: { [Op.gte]: tenMinutesAgo },
            },
        });

        const activeEvents = recentAlerts.length;

        const criticalEvents = recentAlerts.filter(
            (a) => a.alertType?.toLowerCase() === "fall"
        ).length;

        // 4. Storage (real file system)
        const alertsPath = path.join(
            process.cwd(),
            "../web-dashboard/public/alerts"
        );

        const videosPath = path.join(
            process.cwd(),
            "../web-dashboard/public/videos"
        );

        const alertsSize = getFolderSize(alertsPath);
        const videosSize = getFolderSize(videosPath);

        const totalStorageBytes = alertsSize + videosSize;
        const storageUsed = formatBytes(totalStorageBytes);

        // Final response
        res.json({
            video_feeds: {
                active: activeCameras,
                total: totalCameras,
            },
            detections: {
                total: todayAlerts,
                change: alertChange,
            },
            events: {
                active: activeEvents,
                critical: criticalEvents,
            },
            storage: {
                used: storageUsed,
            },
        });

    } catch (err) {
        next(err);
    }
};

const getTodaySummaryController = async (req, res) => {
  try {
    const data = await getTodaySummary();
    res.status(200).json(data);
  } catch (error) {
    console.error("Today summary error:", error);
    res.status(500).json({ message: "Failed to fetch today summary" });
  }
};

const getAlertsBySeverity = async (req, res) => {
  try {
    const data = await getAlertsBySeverityService();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch severity data" });
  }
};

module.exports = {
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
};
