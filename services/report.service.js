import sequelize from "../config/db.js";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ── Shared helper: maps raw alert_type to display label (case-insensitive) ───
const mapDetectionType = (alertType) => {
  const normalized = (alertType ?? "").toLowerCase().trim();
  if (normalized === "fall")   return "Fall Detection";
  if (normalized === "tussle") return "Tussle Detection";
  return alertType;
};

// ── Shared helper: builds a severity AND clause ──────────────────────────────
const sevClause = (severity, tableAlias = null) => {
  if (!severity || severity === "all") return "";
  const col = tableAlias ? `${tableAlias}.severity` : "severity";
  return `AND LOWER(${col}::text) = '${severity.toLowerCase()}'`;
};

/* =========================================================
   📊 DAILY REPORT SERVICE
========================================================= */
export const getDailyReportData = async (severity = "all") => {
  try {
    // ── FIX: CURRENT_DATE cannot have AT TIME ZONE applied to it ─────────────
    const todayFilter = `
      DATE(created_at AT TIME ZONE 'Asia/Colombo') = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Colombo')::date
    `;
    const sw  = sevClause(severity);
    const swa = sevClause(severity, "a");

    const [totals] = await sequelize.query(`
      SELECT 
        COUNT(*)::int                    AS total_detections,
        COUNT(*)::int                    AS total_alerts,
        COUNT(DISTINCT camera_id)::int   AS active_locations
      FROM alerts
      WHERE ${todayFilter} ${sw}
    `);

    const [peak] = await sequelize.query(`
      SELECT 
        TO_CHAR(created_at AT TIME ZONE 'Asia/Colombo', 'HH24:00') AS hour,
        COUNT(*) AS count
      FROM alerts
      WHERE ${todayFilter} ${sw}
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 1
    `);

    const [hourly] = await sequelize.query(`
      WITH hours AS (SELECT generate_series(0, 23) AS h)
      SELECT 
        LPAD(hours.h::text, 2, '0') || ':00' AS hour,
        COUNT(a.id)::int AS detection_count
      FROM hours
      LEFT JOIN alerts a
        ON EXTRACT(HOUR FROM a.created_at AT TIME ZONE 'Asia/Colombo') = hours.h
        AND ${todayFilter.replace('created_at', 'a.created_at')}
        ${swa}
      GROUP BY hours.h
      ORDER BY hours.h
    `);

    const hourlyTrend = hourly.map(r => ({
      hour:           r.hour,
      detectionCount: r.detection_count,
      activityLevel:  r.detection_count < 3 ? "Low" : r.detection_count < 7 ? "Medium" : "High"
    }));

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
        ${swa}
      GROUP BY c.name
      ORDER BY c.name
    `);

    const locationSummary = locations.map(r => ({
      cameraName:  r.camera_name,
      detections:  r.detections,
      alerts:      r.alerts,
      avgSeverity:
        r.avg_severity >= 3.5 ? "Critical" :
        r.avg_severity >= 2.5 ? "High"     :
        r.avg_severity >= 1.5 ? "Medium"   : "Low"
    }));

    const [types] = await sequelize.query(`
      SELECT 
        LOWER(alert_type) AS alert_type,
        COUNT(*)::int AS count,
        ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0), 1) AS percentage
      FROM alerts
      WHERE ${todayFilter} ${sw}
      GROUP BY LOWER(alert_type)
    `);

    const detectionTypeDistribution = types.map(r => ({
      type:         mapDetectionType(r.alert_type),
      count:        r.count,
      sharePercent: `${r.percentage}%`
    }));

    return {
      reportDate:      new Date().toLocaleDateString(),
      totalDetections: totals[0]?.total_detections ?? 0,
      totalAlerts:     totals[0]?.total_alerts      ?? 0,
      activeLocations: totals[0]?.active_locations  ?? 0,
      peakHour:        peak[0]?.hour ?? "N/A",
      hourlyTrend,
      locationSummary,
      detectionTypeDistribution
    };

  } catch (error) {
    console.error("Daily report service error:", error);
    throw error;
  }
};

/* =========================================================
   📊 WEEKLY REPORT SERVICE
========================================================= */
export const getWeeklyReportData = async (severity = "all") => {
  try {
    const [range] = await sequelize.query(`
      SELECT 
        DATE_TRUNC('week', NOW()) AS start,
        DATE_TRUNC('week', NOW()) + INTERVAL '6 days' AS end
    `);

    const weekStart = range[0].start;
    const weekEnd   = range[0].end;
    const sw        = sevClause(severity);
    const swa       = sevClause(severity, "a");

    const [totals] = await sequelize.query(`
      SELECT 
        COUNT(*)::int AS total_detections,
        COUNT(*)::int AS total_alerts,
        COUNT(*) FILTER (WHERE severity = 'Critical')::int AS critical_incidents
      FROM alerts
      WHERE created_at >= NOW() - INTERVAL '7 days'
      ${sw}
    `);

    const avgDaily = Math.round(totals[0].total_detections / 7);

    const [daily] = await sequelize.query(`
      SELECT 
        TO_CHAR(created_at AT TIME ZONE 'Asia/Colombo', 'Dy') AS day,
        COUNT(*)::int AS detections,
        COUNT(*)::int AS alerts,
        AVG(
          CASE severity::text
            WHEN 'Low'      THEN 1
            WHEN 'Medium'   THEN 2
            WHEN 'High'     THEN 3
            WHEN 'Critical' THEN 4
          END
        ) AS avg_severity
      FROM alerts
      WHERE created_at >= NOW() - INTERVAL '7 days'
      ${sw}
      GROUP BY day
      ORDER BY MIN(created_at)
    `);

    const dailyMap = new Map(
      daily.map(r => [r.day, {
        day:         r.day,
        detections:  r.detections,
        alerts:      r.alerts,
        avgSeverity:
          r.avg_severity >= 3.5 ? "Critical" :
          r.avg_severity >= 2.5 ? "High"     :
          r.avg_severity >= 1.5 ? "Medium"   : "Low"
      }])
    );

    const dailyTrend = WEEK_DAYS.map(day =>
      dailyMap.get(day) ?? { day, detections: 0, alerts: 0, avgSeverity: "—" }
    );

    const [locations] = await sequelize.query(`
      SELECT 
        c.name AS camera_name,
        COUNT(a.id)::int AS detections,
        COUNT(a.id)::int AS alerts,
        AVG(
          CASE a.severity::text
            WHEN 'Low'      THEN 1
            WHEN 'Medium'   THEN 2
            WHEN 'High'     THEN 3
            WHEN 'Critical' THEN 4
          END
        ) AS avg_severity
      FROM cameras c
      LEFT JOIN alerts a ON a.camera_id = c.id
      WHERE a.created_at >= NOW() - INTERVAL '7 days'
      ${swa}
      GROUP BY c.name
    `);

    const locationSummary = locations.map(r => ({
      cameraName:  r.camera_name,
      detections:  r.detections,
      alerts:      r.alerts,
      avgSeverity:
        r.avg_severity >= 3.5 ? "Critical" :
        r.avg_severity >= 2.5 ? "High"     :
        r.avg_severity >= 1.5 ? "Medium"   : "Low"
    }));

    const [types] = await sequelize.query(`
      SELECT 
        LOWER(alert_type) AS alert_type,
        COUNT(*)::int AS count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) AS percentage
      FROM alerts
      WHERE created_at >= NOW() - INTERVAL '7 days'
      ${sw}
      GROUP BY LOWER(alert_type)
    `);

    const detectionTypeDistribution = types.map(r => ({
      type:         mapDetectionType(r.alert_type),
      count:        r.count,
      sharePercent: `${r.percentage}%`
    }));

    return {
      weekStart:          new Date(weekStart).toDateString(),
      weekEnd:            new Date(weekEnd).toDateString(),
      totalDetections:    totals[0].total_detections,
      avgDailyDetections: avgDaily,
      totalAlerts:        totals[0].total_alerts,
      criticalIncidents:  totals[0].critical_incidents,
      dailyTrend,
      locationSummary,
      detectionTypeDistribution
    };

  } catch (error) {
    console.error("Weekly report service error:", error);
    throw error;
  }
};

/* =========================================================
   📊 MONTHLY PERFORMANCE REPORT SERVICE
========================================================= */
export const getMonthlyPerformanceReportData = async (severity = "all") => {
  try {
    const [range] = await sequelize.query(`
      SELECT 
        DATE_TRUNC('month', NOW()) AS start,
        DATE_TRUNC('month', NOW()) + INTERVAL '1 month - 1 day' AS end
    `);

    const start = new Date(range[0].start).toISOString();
    const end   = new Date(range[0].end).toISOString();
    const sw    = sevClause(severity);
    const swa   = sevClause(severity, "a");

    // ── Totals ────────────────────────────────────────────────────────────────
    const [totals] = await sequelize.query(`
      SELECT 
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE severity::text = 'Critical')::int AS critical
      FROM alerts
      WHERE created_at BETWEEN :start AND :end
      ${sw}
    `, { replacements: { start, end } });

    const totalDetections   = totals[0].total;
    const totalAlerts       = totals[0].total;
    const criticalIncidents = totals[0].critical;
    const avgDailyDetection = Math.round(totalDetections / 30);

    // ── Current vs last month ─────────────────────────────────────────────────
    const sevInline = (!severity || severity === "all")
      ? ""
      : `AND LOWER(severity::text) = '${severity.toLowerCase()}'`;

    const [compare] = await sequelize.query(`
      SELECT
        COUNT(*) FILTER (
          WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
          ${sevInline}
        ) AS this_month,
        COUNT(*) FILTER (
          WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW() - INTERVAL '1 month')
          ${sevInline}
        ) AS last_month
      FROM alerts
    `);

    const thisMonth    = Number(compare[0].this_month) || 0;
    const lastMonthRaw = Number(compare[0].last_month) || 0;

    let currentVsLastMonth;
    if (lastMonthRaw === 0) {
      currentVsLastMonth = thisMonth > 0 ? "+100%" : "0%";
    } else {
      const change = ((thisMonth - lastMonthRaw) / lastMonthRaw) * 100;
      currentVsLastMonth = `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
    }

    // ── Detection accuracy — FIX: now includes ${sw} severity filter ──────────
    const [accuracy] = await sequelize.query(`
      SELECT 
        COUNT(*) FILTER (WHERE validation_status = 'Valid') AS valid,
        COUNT(*) AS total
      FROM alerts
      WHERE created_at BETWEEN :start AND :end
      ${sw}
    `, { replacements: { start, end } });

    const validCount        = Number(accuracy[0].valid) || 0;
    const totalCount2       = Number(accuracy[0].total) || 1;
    const detectionAccuracy = `${Math.round((validCount / totalCount2) * 100)}%`;

    // ── Monthly trend (weekly buckets) ────────────────────────────────────────
    const [monthlyTrendRaw] = await sequelize.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('week', created_at), 'Mon DD') AS week,
        COUNT(*)::int AS detections
      FROM alerts
      WHERE created_at BETWEEN :start AND :end
      ${sw}
      GROUP BY DATE_TRUNC('week', created_at)
      ORDER BY MIN(created_at)
    `, { replacements: { start, end } });

    const monthlyTrend = monthlyTrendRaw.map(r => ({
      week:       r.week,
      detections: r.detections,
      alerts:     r.detections
    }));

    // ── Location summary ──────────────────────────────────────────────────────
    const [locations] = await sequelize.query(`
      SELECT 
        c.name AS camera_name,
        COUNT(a.id)::int AS detections,
        COUNT(a.id)::int AS alerts,
        AVG(
          CASE a.severity::text
            WHEN 'Low'      THEN 1
            WHEN 'Medium'   THEN 2
            WHEN 'High'     THEN 3
            WHEN 'Critical' THEN 4
          END
        ) AS avg_severity
      FROM cameras c
      LEFT JOIN alerts a ON a.camera_id = c.id
      WHERE a.created_at BETWEEN :start AND :end
      ${swa}
      GROUP BY c.name
      ORDER BY c.name
    `, { replacements: { start, end } });

    const locationSummary = locations.map(r => ({
      cameraName:  r.camera_name,
      detections:  r.detections,
      alerts:      r.alerts,
      avgSeverity:
        r.avg_severity >= 3.5 ? "Critical" :
        r.avg_severity >= 2.5 ? "High"     :
        r.avg_severity >= 1.5 ? "Medium"   : "Low"
    }));

    // ── Detection types ───────────────────────────────────────────────────────
    const [types] = await sequelize.query(`
      SELECT 
        LOWER(alert_type) AS alert_type,
        COUNT(*)::int AS count,
        ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER (), 0), 1) AS percentage
      FROM alerts
      WHERE created_at BETWEEN :start AND :end
      ${sw}
      GROUP BY LOWER(alert_type)
    `, { replacements: { start, end } });

    const totalTypeCount = types.reduce((s, r) => s + Number(r.count), 0) || 1;
    const detectionTypeDistribution = types.map(r => ({
      type:         mapDetectionType(r.alert_type),
      count:        r.count,
      sharePercent: `${r.percentage ?? Math.round((r.count / totalTypeCount) * 100)}%`
    }));

    // ── Yearly trend ──────────────────────────────────────────────────────────
    const [yearly] = await sequelize.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS month,
        COUNT(*)::int AS detections
      FROM alerts
      WHERE created_at >= DATE_TRUNC('year', NOW())
      ${sw}
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `);

    const yearlyTrend = yearly.map(r => ({
      month:      r.month,
      detections: r.detections,
      alerts:     r.detections
    }));

    // ── Critical incident highlights ──────────────────────────────────────────
    const [critical] = await sequelize.query(`
      SELECT 
        a.created_at,
        a.alert_type,
        a.response_time_min,
        a.action_taken,
        c.name AS camera_name
      FROM alerts a
      LEFT JOIN cameras c ON c.id = a.camera_id
      WHERE a.severity::text = 'Critical'
        AND a.created_at BETWEEN :start AND :end
      ORDER BY a.created_at DESC
      LIMIT 5
    `, { replacements: { start, end } });

    const criticalIncidentHighlights = critical.map(r => ({
      date:           new Date(r.created_at).toLocaleDateString(),
      cameraName:     r.camera_name ?? "Unknown Camera",
      detectionType:  mapDetectionType(r.alert_type),
      acknowledgedBy: "Admin",
      responseTime:   r.response_time_min ?? "-",
      actionTaken:    r.action_taken      ?? "-"
    }));

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
   (no severity filter — this is about user accounts)
========================================================= */
export const getMonthlyAccountReportData = async () => {
  try {
    const [range] = await sequelize.query(`
      SELECT 
        DATE_TRUNC('month', NOW()) AS start,
        DATE_TRUNC('month', NOW()) + INTERVAL '1 month - 1 day' AS end
    `);

    const start = range[0].start;
    const end   = range[0].end;

    const [totals] = await sequelize.query(`
      SELECT 
        COUNT(*) FILTER (WHERE "createdAt" BETWEEN :start AND :end)       AS new_accounts,
        COUNT(*) FILTER (WHERE LOWER(status) IN ('inactive','suspended'))  AS inactive_suspended,
        COUNT(*) FILTER (WHERE role = 'admin')                             AS privileged_accounts,
        COUNT(*) FILTER (WHERE LOWER(status) = 'active')                  AS total_active
      FROM "Users"
    `, { replacements: { start, end } });

    const [weekly] = await sequelize.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('week', "createdAt"), 'Mon DD') AS week,
        COUNT(*) FILTER (WHERE "createdAt" BETWEEN :start AND :end)       AS new_accounts,
        COUNT(*) FILTER (WHERE LOWER(status) IN ('inactive','suspended'))  AS inactive_suspended,
        COUNT(*) FILTER (WHERE role = 'admin')                             AS privileged_accounts
      FROM "Users"
      GROUP BY DATE_TRUNC('week', "createdAt")
      ORDER BY DATE_TRUNC('week', "createdAt")
    `, { replacements: { start, end } });

    const [categories] = await sequelize.query(`
      SELECT role AS type, COUNT(*)::int AS count
      FROM "Users"
      GROUP BY role
    `);

    const accountCategorySummary = categories.map(r => ({
      type:    String(r.type  ?? "Unknown"),
      count:   Number(r.count ?? 0),
      remarks: r.type === "admin" ? "Full system access" : "Standard access",
    }));

    const [privileged] = await sequelize.query(`
      SELECT username, role, "lastLoginAt", status
      FROM "Users"
      WHERE role = 'admin'
    `);

    const privilegedAccountReview = privileged.map(r => ({
      account:   String(r.username    ?? "N/A"),
      role:      String(r.role        ?? "N/A"),
      lastLogin: r.lastLoginAt ? new Date(r.lastLoginAt).toLocaleDateString() : "Never",
      status:    String(r.status      ?? "N/A"),
    }));

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