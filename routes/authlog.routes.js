import express from "express";
import * as authLogController from "../controllers/authlog.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, authLogController.createAuthLog);
router.get("/", protect, authLogController.getAllAuthLogs);
router.get("/:id", protect, authLogController.getAuthLogById);
router.put("/:id", protect, authLogController.updateAuthLog);
router.delete("/:id", protect, authLogController.deleteAuthLog);

export default router;
