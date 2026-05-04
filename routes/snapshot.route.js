const express = require("express");
const { listFolders, listSnapshots } = require("../controllers/snapshot.controller.js");

const router = express.Router();

// GET /api/snapshots/folders -> Returns list of cameras
router.get('/folders', listFolders);

// GET /api/snapshots/camera/:cameraId -> Returns images for that camera
router.get('/camera/:cameraId', listSnapshots);

module.exports = router;