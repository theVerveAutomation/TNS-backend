import express from "express";
import * as alertController from "../controllers/alert.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", alertController.createAlert);
router.get("/", alertController.getAllAlerts);
router.get("/recent", alertController.getRecentAlerts); // ✅ MUST be before /:id
router.get("/:id", alertController.getAlertById);
router.put("/:id", alertController.updateAlert);
router.delete("/:id", alertController.deleteAlert);

export default router;