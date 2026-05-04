const express = require("express"); // Depending on your setup, it might just be 'express'
const { streamMedia } = require("../controllers/media.controller.js");

const router = express.Router();

// Define the GET route
// This will resolve to GET /api/media (or wherever you mount it in index.js)
router.get('/', streamMedia);

module.exports = router;