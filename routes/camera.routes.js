import express from "express";
import * as cameraController from "../controllers/camera.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, cameraController.createCamera);
router.get("/", protect, cameraController.getAllCameras);
router.get("/:id", protect, cameraController.getCameraById);
router.put("/:id", protect, cameraController.updateCamera);
router.delete("/:id", protect, cameraController.deleteCamera);

export default router;
