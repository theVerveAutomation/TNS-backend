const express = require("express");
const cameraController = require("../controllers/camera.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.post("/", protect, cameraController.createCamera);
router.get("/", protect, cameraController.getAllCameras);
router.get("/:id", protect, cameraController.getCameraById);
router.put("/:id", protect, cameraController.updateCamera);
router.patch("/:id/settings", protect, cameraController.updateCameraSettings);
router.delete("/:id", protect, cameraController.deleteCamera);

module.exports = router;
