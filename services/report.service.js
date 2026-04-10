import sequelize from "../config/db.js";

/* =========================================================
   📊 DAILY REPORT SERVICE — fixed with date filter
========================================================= */
export const getDailyReportData = async () => {
  try {

    // =========================
    // 📌 TODAY's date range in Asia/Colombo
    // =========================
    const todayFilter = `
      DATE(created_at AT TIME ZONE 'Asia/Colombo') = CURRENT_DATE AT TIME ZONE 'Asia/Colombo'
    `;

    // =========================
    // 📌 TOTAL METRICS — today only
    // =========================
    const [totals] = await sequelize.query(`
      SELECT 
        COUNT(*)::int                    AS total_detections,
        COUNT(*)::int                    AS total_alerts,
        COUNT(DISTINCT camera_id)::int   AS active_locations
      FROM alerts
      WHERE ${todayFilter}
    `);

    // =========================
    // 📌 PEAK HOUR — today only
    // =========================
    const [peak] = await sequelize.query(`
      SELECT 
        TO_CHAR(created_at AT TIME ZONE 'Asia/Colombo', 'HH24:00') AS hour,
        COUNT(*) AS count
      FROM alerts
      WHERE ${todayFilter}
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 1
    `);

    // =========================
    // 📌 HOURLY TREND — today only (all 24 hours, 0-filled)
    // =========================
    const [hourly] = await sequelize.query(`
      WITH hours AS (
        SELECT generate_series(0, 23) AS h
      )
      SELECT 
        LPAD(hours.h::text, 2, '0') || ':00' AS hour,
        COUNT(a.id)::int AS detection_count
      FROM hours
      LEFT JOIN alerts a
        ON EXTRACT(HOUR FROM a.created_at AT TIME ZONE 'Asia/Colombo') = hours.h
        AND ${todayFilter.replace('created_at', 'a.created_at')}
      GROUP BY hours.h
      ORDER BY hours.h
    `);

    const hourlyTrend = hourly.map(r => ({
      hour:           r.hour,
      detectionCount: r.detection_count,
      activityLevel:
        r.detection_count < 3 ? "Low" :
        r.detection_count < 7 ? "Medium" : "High"
    }));

    // =========================
    // 📌 LOCATION SUMMARY — today only
    // =========================
    const [locations] = await sequelize.query(`
      SELECT 
        c.name AS camera_name,
        COUNT(a.id)::int AS detections,
        COUNT(a.id)::int AS alerts,
        AVG(
          CASE a.severity
            WHEN 'Low'      THEN 1
            WHEN 'Medium'   THEN 2
            WHEN 'High'     THEN 3
            WHEN 'Critical' THEN 4
          END
        ) AS avg_severity
      FROM cameras c
      LEFT JOIN alerts a
        ON a.camera_id = c.id
        AND ${todayFilter.replace('created_at', 'a.created_at')}
      GROUP BY c.name
      ORDER BY c.name
    `);

    const locationSummary = locations.map(r => ({
      cameraName: r.camera_name,
      detections: r.detections,
      alerts:     r.alerts,
      avgSeverity:
        r.avg_severity >= 3.5 ? "Critical" :
        r.avg_severity >= 2.5 ? "High"     :
        r.avg_severity >= 1.5 ? "Medium"   : "Low"
    }));

    // =========================
    // 📌 DETECTION TYPE DISTRIBUTION — today only
    // =========================
    const [types] = await sequelize.query(`
      SELECT 
        alert_type,
        COUNT(*)::int AS count,
        ROUND(
          COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0),
          1
        ) AS percentage
      FROM alerts
      WHERE ${todayFilter}
      GROUP BY alert_type
    `);

    const detectionTypeDistribution = types.map(r => ({
      type:         r.alert_type,
      count:        r.count,
      sharePercent: `${r.percentage}%`
    }));

    // =========================
    // 📌 FINAL OBJECT
    // =========================
    return {
      reportDate:               new Date().toLocaleDateString(),
      totalDetections:          totals[0]?.total_detections  ?? 0,
      totalAlerts:              totals[0]?.total_alerts       ?? 0,
      activeLocations:          totals[0]?.active_locations   ?? 0,
      peakHour:                 peak[0]?.hour                 ?? "N/A",
      hourlyTrend,
      locationSummary,
      detectionTypeDistribution
    };

  } catch (error) {
    console.error("Daily report service error:", error);
    throw error;
  }
};