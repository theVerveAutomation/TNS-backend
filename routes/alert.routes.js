const express = require("express");
const alertController = require("../controllers/alert.controller.js");
const { protect } = require("../middleware/auth.middleware.js");
const { getDashboardAlertsSummary } = require("../controllers/dashboard.controller.js");

const router = express.Router();

router.post("/", alertController.createAlert);
router.get("/", alertController.getAllAlerts);
router.get("/recent", alertController.getRecentAlerts); 
router.get("/event-logs", protect, alertController.getEventLogs);
router.get("/:id", alertController.getAlertById);
router.put("/:id", alertController.updateAlert);
router.delete("/:id", alertController.deleteAlert);
router.post("/:id/review", protect, alertController.reviewAlert);
router.get("/dashboard/alerts-summary", getDashboardAlertsSummary);


module.exports = router;