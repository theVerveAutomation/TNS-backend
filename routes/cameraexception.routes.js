import express from "express";
import * as cameraExceptionController from "../controllers/cameraexception.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, cameraExceptionController.createCameraException);
router.get("/", protect, cameraExceptionController.getAllCameraExceptions);
router.get("/:id", protect, cameraExceptionController.getCameraExceptionById);
router.put("/:id", protect, cameraExceptionController.updateCameraException);
router.delete("/:id", protect, cameraExceptionController.deleteCameraException);

export default router;
