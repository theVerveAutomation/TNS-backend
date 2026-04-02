import express from "express";
import * as cameraFeatureController from "../controllers/camerafeature.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, cameraFeatureController.createCameraFeature);
router.get("/", protect, cameraFeatureController.getAllCameraFeatures);
router.get("/:id", protect, cameraFeatureController.getCameraFeatureById);
router.put("/:id", protect, cameraFeatureController.updateCameraFeature);
router.delete("/:id", protect, cameraFeatureController.deleteCameraFeature);

export default router;
