import express from "express";
import * as featureController from "../controllers/feature.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, featureController.createFeature);
router.get("/", protect, featureController.getAllFeatures);
router.get("/:id", protect, featureController.getFeatureById);
router.put("/:id", protect, featureController.updateFeature);
router.delete("/:id", protect, featureController.deleteFeature);

export default router;
