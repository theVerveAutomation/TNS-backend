const express = require("express");
const featureController = require("../controllers/feature.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.post("/", protect, featureController.createFeature);
router.get("/", protect, featureController.getAllFeatures);
router.get("/:id", protect, featureController.getFeatureById);
router.put("/:id", protect, featureController.updateFeature);
router.delete("/:id", protect, featureController.deleteFeature);

module.exports = router;
