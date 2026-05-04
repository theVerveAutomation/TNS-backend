const { Alert } = require("../models/Alert.js");
const { Camera } = require("../models/Camera.js");

const getDashboardAlertsSummary = async (req, res) => {
  try {
    const alerts = await Alert.findAll({
      where: {
        isReviewed: false,
      },
      include: [{ model: Camera, attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });

    const now = new Date();

    const isToday = (date) => {
      const d = new Date(date);
      return d.toDateString() === now.toDateString();
    };

    const isOverdue = (alert) => {
      const created = new Date(alert.createdAt);
      return (
        !alert.isReviewed &&
        now.getTime() - created.getTime() > 60 * 60 * 1000
      );
    };

    const groupByType = (type) => {
      const filtered = alerts.filter(
        (a) => a.alertType?.toLowerCase() === type
      );

      return {
        overdue: filtered.filter(isOverdue),
        today: filtered.filter(
          (a) => isToday(a.createdAt) && !isOverdue(a)
        ),
      };
    };

    const fall = groupByType("fall");
    const tussle = groupByType("tussle");

    const cameraAlerts = alerts.filter(
      (a) => a.alertType?.toLowerCase() === "camera"
    );

    res.json({
      fall: {
        overdueCount: fall.overdue.length,
        todayCount: fall.today.length,
        overdue: fall.overdue.slice(0, 5),
        today: fall.today.slice(0, 5),
      },
      tussle: {
        overdueCount: tussle.overdue.length,
        todayCount: tussle.today.length,
        overdue: tussle.overdue.slice(0, 5),
        today: tussle.today.slice(0, 5),
      },
      camera: {
        overdueCount: cameraAlerts.filter(isOverdue).length,
        todayCount: cameraAlerts.filter((a) => isToday(a.createdAt) && !isOverdue(a)).length,
        overdue: cameraAlerts.filter(isOverdue).slice(0, 5),
        today: cameraAlerts.filter((a) => isToday(a.createdAt) && !isOverdue(a)).slice(0, 5),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getDashboardAlertsSummary };
