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
      hour: r.hour,
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
      alerts: r.alerts,
      avgSeverity:
        r.avg_severity >= 3.5 ? "Critical" :
          r.avg_severity >= 2.5 ? "High" :
            r.avg_severity >= 1.5 ? "Medium" : "Low"
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
      type: r.alert_type,
      count: r.count,
      sharePercent: `${r.percentage}%`
    }));

    // =========================
    // 📌 FINAL OBJECT
    // =========================
    return {
      reportDate: new Date().toLocaleDateString(),
      totalDetections: totals[0]?.total_detections ?? 0,
      totalAlerts: totals[0]?.total_alerts ?? 0,
      activeLocations: totals[0]?.active_locations ?? 0,
      peakHour: peak[0]?.hour ?? "N/A",
      hourlyTrend,
      locationSummary,
      detectionTypeDistribution
    };

  } catch (error) {
    console.error("Daily report service error:", error);
    throw error;
  }
};

export const getWeeklyReportData = async () => {
  try {

    // =========================
    // 📊 WEEKLY REPORT — DATE RANGE
    // =========================
    const [range] = await sequelize.query(`
      SELECT 
        DATE_TRUNC('week', NOW()) AS start,
        DATE_TRUNC('week', NOW()) + INTERVAL '6 days' AS end
    `);

    const weekStart = range[0].start;
    const weekEnd = range[0].end;

    // =========================
    // 📊 WEEKLY REPORT — TOTALS
    // =========================
    const [totals] = await sequelize.query(`
      SELECT 
        COUNT(*)::int AS total_detections,
        COUNT(*)::int AS total_alerts,
        COUNT(*) FILTER (WHERE severity = 'Critical')::int AS critical_incidents
      FROM alerts
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);

    const avgDaily = Math.round(totals[0].total_detections / 7);

    // =========================
    // 📊 WEEKLY REPORT — DAILY TREND
    // =========================
    const [daily] = await sequelize.query(`
      SELECT 
        TO_CHAR(created_at AT TIME ZONE 'Asia/Colombo', 'Dy') AS day,
        COUNT(*)::int AS detections,
        COUNT(*)::int AS alerts,
        AVG(
          CASE severity
            WHEN 'Low' THEN 1
            WHEN 'Medium' THEN 2
            WHEN 'High' THEN 3
            WHEN 'Critical' THEN 4
          END
        ) AS avg_severity
      FROM alerts
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY day
      ORDER BY MIN(created_at)
    `);

    const dailyTrend = daily.map(r => ({
      day: r.day,
      detections: r.detections,
      alerts: r.alerts,
      avgSeverity:
        r.avg_severity >= 3.5 ? "Critical" :
          r.avg_severity >= 2.5 ? "High" :
            r.avg_severity >= 1.5 ? "Medium" : "Low"
    }));

    // =========================
    // 📊 WEEKLY REPORT — LOCATION SUMMARY
    // =========================
    const [locations] = await sequelize.query(`
      SELECT 
        c.name AS camera_name,
        COUNT(a.id)::int AS detections,
        COUNT(a.id)::int AS alerts,
        AVG(
          CASE a.severity
            WHEN 'Low' THEN 1
            WHEN 'Medium' THEN 2
            WHEN 'High' THEN 3
            WHEN 'Critical' THEN 4
          END
        ) AS avg_severity
      FROM cameras c
      LEFT JOIN alerts a ON a.camera_id = c.id
      WHERE a.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY c.name
    `);

    const locationSummary = locations.map(r => ({
      cameraName: r.camera_name,
      detections: r.detections,
      alerts: r.alerts,
      avgSeverity:
        r.avg_severity >= 3.5 ? "Critical" :
          r.avg_severity >= 2.5 ? "High" :
            r.avg_severity >= 1.5 ? "Medium" : "Low"
    }));

    // =========================
    // 📊 WEEKLY REPORT — DETECTION TYPES
    // =========================
    const [types] = await sequelize.query(`
      SELECT 
        alert_type,
        COUNT(*)::int AS count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS percentage
      FROM alerts
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY alert_type
    `);

    const detectionTypeDistribution = types.map(r => ({
      type: r.alert_type === "fall" ? "Fall Detection" : "Tussle Detection",
      count: r.count,
      sharePercent: `${r.percentage}%`
    }));

    // =========================
    // FINAL
    // =========================
    return {
      weekStart: new Date(weekStart).toDateString(),
      weekEnd: new Date(weekEnd).toDateString(),
      totalDetections: totals[0].total_detections,
      avgDailyDetections: avgDaily,
      totalAlerts: totals[0].total_alerts,
      criticalIncidents: totals[0].critical_incidents,
      dailyTrend,
      locationSummary,
      detectionTypeDistribution
    };

  } catch (error) {
    console.error("Weekly report service error:", error);
    throw error;
  }
};

export const getMonthlyPerformanceReportData = async () => {
  try {
    // =========================
    // DATE RANGES
    // =========================
    const [range] = await sequelize.query(`
      SELECT 
        DATE_TRUNC('month', NOW()) AS start,
        DATE_TRUNC('month', NOW()) + INTERVAL '1 month - 1 day' AS end
    `);

    const start = new Date(range[0].start).toISOString();
    const end = new Date(range[0].end).toISOString();

    // =========================
    // TOTALS
    // =========================
    const [totals] = await sequelize.query(`
      SELECT 
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE severity = 'Critical')::int AS critical
      FROM alerts
      WHERE created_at BETWEEN :start AND :end
    `, {
      replacements: { start, end }
    });

    const totalDetections = totals[0].total;
    const totalAlerts = totals[0].total;
    const criticalIncidents = totals[0].critical;

    const avgDailyDetection = Math.round(totalDetections / 30);

    // =========================
    // CURRENT VS LAST MONTH
    // =========================
    const [compare] = await sequelize.query(`
      SELECT
        COUNT(*) FILTER (
          WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
        ) AS this_month,
        COUNT(*) FILTER (
          WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')
        ) AS last_month
      FROM alerts
    `);

    const thisMonth = Number(compare[0].this_month) || 0;
    const lastMonthRaw = Number(compare[0].last_month) || 0;

    let currentVsLastMonth;

    if (lastMonthRaw === 0) {
      currentVsLastMonth = thisMonth > 0 ? "+100%" : "0%";
    } else {
      const change = ((thisMonth - lastMonthRaw) / lastMonthRaw) * 100;
      currentVsLastMonth = `${change.toFixed(1)}%`;
    }

    // =========================
    // DETECTION ACCURACY (derived)
    // =========================
    const [accuracy] = await sequelize.query(`
      SELECT 
        COUNT(*) FILTER (WHERE validation_status = 'Valid') AS valid,
        COUNT(*) AS total
      FROM alerts
    `);

    const valid = Number(accuracy[0].valid) || 0;
    const total = Number(accuracy[0].total) || 1;

    const detectionAccuracy = `${Math.round((valid / total) * 100)}%`;

    // =========================
    // MONTHLY TREND (weekly)
    // =========================
    const [monthlyTrendRaw] = await sequelize.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('week', created_at), 'Mon DD') AS week,
        COUNT(*)::int AS detections
      FROM alerts
      WHERE created_at BETWEEN :start AND :end
      GROUP BY week
      ORDER BY MIN(created_at)
    `, {
      replacements: { start, end }
    });

    const monthlyTrend = monthlyTrendRaw.map(r => ({
      week: r.week,
      detections: r.detections,
      alerts: r.detections
    }));

    // =========================
    // LOCATION SUMMARY
    // =========================
    const [locations] = await sequelize.query(`
      SELECT 
        c.name AS camera_name,
        COUNT(a.id)::int AS detections,
        COUNT(a.id)::int AS alerts
      FROM cameras c
      LEFT JOIN alerts a ON a.camera_id = c.id
      WHERE a.created_at BETWEEN :start AND :end
      GROUP BY c.name
    `, {
      replacements: { start, end }
    });

    const locationSummary = locations.map(r => ({
      cameraName: r.camera_name,
      detections: r.detections,
      alerts: r.alerts,
      avgSeverity: "Medium"
    }));

    // =========================
    // DETECTION TYPES
    // =========================
    const [types] = await sequelize.query(`
      SELECT 
        alert_type,
        COUNT(*)::int AS count
      FROM alerts
      WHERE created_at BETWEEN :start AND :end
      GROUP BY alert_type
    `, {
      replacements: { start, end }
    });

    const totalCount = types.reduce((s, r) => s + Number(r.count), 0) || 1;

    const detectionTypeDistribution = types.map(r => ({
      type: r.alert_type === "fall" ? "Fall Detection" : "Tussle Detection",
      count: r.count,
      sharePercent: `${Math.round((r.count / totalCount) * 100)}%`
    }));

    // =========================
    // YEARLY TREND
    // =========================
    const [yearly] = await sequelize.query(`
      SELECT 
        TO_CHAR(created_at, 'Mon') AS month,
        COUNT(*)::int AS detections
      FROM alerts
      GROUP BY month
      ORDER BY MIN(created_at)
    `);

    const yearlyTrend = yearly.map(r => ({
      month: r.month,
      detections: r.detections,
      alerts: r.detections
    }));

    // =========================
    // CRITICAL INCIDENTS
    // =========================
    const [critical] = await sequelize.query(`
      SELECT 
        created_at,
        alert_type,
        response_time_min,
        action_taken
      FROM alerts
      WHERE severity = 'Critical'
      ORDER BY created_at DESC
      LIMIT 5
    `);

    const criticalIncidentHighlights = critical.map(r => ({
      date: new Date(r.created_at).toLocaleDateString(),
      cameraName: "Camera",
      detectionType: r.alert_type,
      acknowledgedBy: "Admin",
      responseTime: r.response_time_min ?? "-",
      actionTaken: r.action_taken ?? "-"
    }));

    // =========================
    // FINAL OBJECT
    // =========================
    return {
      month: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
      totalDetections,
      totalAlerts,
      avgDailyDetection,
      currentVsLastMonth,
      criticalIncidents,
      detectionAccuracy,
      monthlyTrend,
      locationSummary,
      detectionTypeDistribution,
      yearlyTrend,
      criticalIncidentHighlights
    };

  } catch (error) {
    console.error("Monthly report error:", error);
    throw error;
  }
};

/* =========================================================
   📊 MONTHLY ACCOUNT REPORT SERVICE
========================================================= */
export const getMonthlyAccountReportData = async () => {
  try {
    // =========================
    // 📅 DATE RANGE
    // =========================
    const [range] = await sequelize.query(`
      SELECT 
        DATE_TRUNC('month', NOW()) AS start,
        DATE_TRUNC('month', NOW()) + INTERVAL '1 month - 1 day' AS end
    `);

    const start = range[0].start;
    const end   = range[0].end;

    // =========================
    // 📊 TOP METRICS
    // =========================
    const [totals] = await sequelize.query(`
      SELECT 
        COUNT(*) FILTER (
          WHERE "createdAt" BETWEEN :start AND :end
        ) AS new_accounts,

        COUNT(*) FILTER (
          WHERE LOWER(status) IN ('inactive','suspended')
        ) AS inactive_suspended,

        COUNT(*) FILTER (
          WHERE role = 'admin'
        ) AS privileged_accounts,

        COUNT(*) FILTER (
          WHERE LOWER(status) = 'active'
        ) AS total_active

      FROM "Users"
    `, {
      replacements: { start, end }
    });

    // =========================
    // 📊 WEEKLY TREND
    // =========================
    const [weekly] = await sequelize.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('week', "createdAt"), 'Mon DD') AS week,

        COUNT(*) FILTER (
          WHERE "createdAt" BETWEEN :start AND :end
        ) AS new_accounts,

        COUNT(*) FILTER (
          WHERE LOWER(status) IN ('inactive','suspended')
        ) AS inactive_suspended,

        COUNT(*) FILTER (
          WHERE role = 'admin'
        ) AS privileged_accounts

      FROM "Users"
      GROUP BY DATE_TRUNC('week', "createdAt")
      ORDER BY DATE_TRUNC('week', "createdAt")
    `, {
      replacements: { start, end }
    });

    // =========================
    // 📊 CATEGORY SUMMARY
    // =========================
    const [categories] = await sequelize.query(`
      SELECT 
        role AS type,
        COUNT(*)::int AS count
      FROM "Users"
      GROUP BY role
    `);

    const accountCategorySummary = categories.map(r => ({
      type:    String(r.type  ?? "Unknown"),
      count:   Number(r.count ?? 0),
      remarks: r.type === "admin"
        ? "Full system access"
        : "Standard access",
    }));

    // =========================
    // 📊 PRIVILEGED USERS
    // =========================
    const [privileged] = await sequelize.query(`
      SELECT 
        username,
        role,
        "lastLoginAt",
        status
      FROM "Users"
      WHERE role = 'admin'
    `);

    const privilegedAccountReview = privileged.map(r => ({
      account:   String(r.username ?? "N/A"),
      role:      String(r.role     ?? "N/A"),
      lastLogin: r.lastLoginAt
        ? new Date(r.lastLoginAt).toLocaleDateString()
        : "Never",
      status:    String(r.status   ?? "N/A"),
    }));

    // =========================
    // 📊 FINAL OBJECT
    // =========================
    const t = totals[0] ?? {};

    return {
      reportMonth:   String(new Date().toLocaleString("default", { month: "long", year: "numeric" })),
      generatedDate: String(new Date().toLocaleDateString()),

      newAccounts:        Number(t.new_accounts        ?? 0),
      inactiveSuspended:  Number(t.inactive_suspended  ?? 0),
      privilegedAccounts: Number(t.privileged_accounts ?? 0),
      totalActive:        Number(t.total_active        ?? 0),

      monthlyActivityTrend: weekly.map(r => ({
        week:               String(r.week               ?? "N/A"),
        newAccounts:        Number(r.new_accounts        ?? 0),
        inactiveSuspended:  Number(r.inactive_suspended  ?? 0),
        privilegedAccounts: Number(r.privileged_accounts ?? 0),
      })),

      accountCategorySummary,
      privilegedAccountReview,
    };

  } catch (error) {
    console.error("Monthly Account Report FULL ERROR:", error);
    throw error;
  }
};