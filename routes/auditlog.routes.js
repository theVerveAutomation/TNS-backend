const express = require("express");
const auditLogController = require("../controllers/auditlog.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.post("/", protect, auditLogController.createAuditLog);
router.get("/", protect, auditLogController.getAuditLogs);
router.get("/:id", protect, auditLogController.getAuditLogById);
router.put("/:id", protect, auditLogController.updateAuditLog);
router.delete("/:id", protect, auditLogController.deleteAuditLog);

module.exports = router;
