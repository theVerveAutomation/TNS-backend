import express from 'express';
import { listFolders, listSnapshots } from '../controllers/snapshot.controller.js';

const router = express.Router();

// GET /api/snapshots/folders -> Returns list of cameras
router.get('/folders', listFolders);

// GET /api/snapshots/camera/:cameraId -> Returns images for that camera
router.get('/camera/:cameraId', listSnapshots);

export default router;