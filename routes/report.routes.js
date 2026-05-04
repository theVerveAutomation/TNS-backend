const express = require("express");
const { 
    getDailyReport,
    getWeeklyReport,
    getMonthlyReport,
    getMonthlyAccountReport
} = require("../controllers/report.controller.js");

const router = express.Router();

router.get("/daily", getDailyReport);
router.get("/weekly", getWeeklyReport);
router.get("/monthly", getMonthlyReport);
router.get("/account-monthly", getMonthlyAccountReport);

module.exports = router;