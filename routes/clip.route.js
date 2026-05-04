const express = require("express");
const { listFolders, listClips } = require("../controllers/clip.controller.js");

const router = express.Router();

router.get('/folders', listFolders);
router.get('/camera/:cameraId', listClips);

module.exports = router;