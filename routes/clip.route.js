import express from 'express';
import { listFolders, listClips } from '../controllers/clip.controller.js';

const router = express.Router();

router.get('/folders', listFolders);
router.get('/camera/:cameraId', listClips);

export default router;