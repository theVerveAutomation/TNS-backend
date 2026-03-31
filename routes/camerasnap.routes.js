import express from "express";
import * as cameraSnapController from "../controllers/camerasnap.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, cameraSnapController.createCameraSnap);
router.get("/", protect, cameraSnapController.getAllCameraSnaps);
router.get("/:id", protect, cameraSnapController.getCameraSnapById);
router.put("/:id", protect, cameraSnapController.updateCameraSnap);
router.delete("/:id", protect, cameraSnapController.deleteCameraSnap);

export default router;
