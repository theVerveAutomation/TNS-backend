import express from "express";
import * as alertController from "../controllers/alert.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, alertController.createAlert);
router.get("/", protect, alertController.getAllAlerts);
router.get("/:id", protect, alertController.getAlertById);
router.put("/:id", protect, alertController.updateAlert);
router.delete("/:id", protect, alertController.deleteAlert);

export default router;
