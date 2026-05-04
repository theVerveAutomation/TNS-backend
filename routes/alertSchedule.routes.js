const express = require("express");
const {
  getSchedule,
  updateSchedule,
} = require("../controllers/alertSchedule.controller.js");
const { protect } = require("../middleware/auth.middleware.js"); 

const router = express.Router();

router.get("/", protect, getSchedule);     
router.post("/", protect, updateSchedule); 

module.exports = router;