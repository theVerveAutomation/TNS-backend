const express = require("express");
const cameraSnapController = require("../controllers/camerasnap.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.post("/", protect, cameraSnapController.createCameraSnap);
router.get("/", protect, cameraSnapController.getAllCameraSnaps);
router.get("/:id", protect, cameraSnapController.getCameraSnapById);
router.put("/:id", protect, cameraSnapController.updateCameraSnap);
router.delete("/:id", protect, cameraSnapController.deleteCameraSnap);

module.exports = router;
