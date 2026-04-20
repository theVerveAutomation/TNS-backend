import express from "express";
import * as auditLogController from "../controllers/auditlog.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, auditLogController.createAuditLog);
router.get("/", protect, auditLogController.getAuditLogs);
router.get("/:id", protect, auditLogController.getAuditLogById);
router.put("/:id", protect, auditLogController.updateAuditLog);
router.delete("/:id", protect, auditLogController.deleteAuditLog);

export default router;
