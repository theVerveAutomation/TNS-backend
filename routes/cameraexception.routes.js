const express = require("express");
const cameraExceptionController = require("../controllers/cameraexception.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.post("/", protect, cameraExceptionController.createCameraException);
router.get("/", protect, cameraExceptionController.getAllCameraExceptions);
router.get("/:id", protect, cameraExceptionController.getCameraExceptionById);
router.put("/:id", protect, cameraExceptionController.updateCameraException);
router.delete("/:id", protect, cameraExceptionController.deleteCameraException);

module.exports = router;
