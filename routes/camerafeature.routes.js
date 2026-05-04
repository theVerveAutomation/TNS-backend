const express = require("express");
const cameraFeatureController = require("../controllers/camerafeature.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.post("/", protect, cameraFeatureController.createCameraFeature);
router.get("/", protect, cameraFeatureController.getAllCameraFeatures);
router.get("/:id", protect, cameraFeatureController.getCameraFeatureById);
router.put("/:id", protect, cameraFeatureController.updateCameraFeature);
router.delete("/:id", protect, cameraFeatureController.deleteCameraFeature);

module.exports = router;
