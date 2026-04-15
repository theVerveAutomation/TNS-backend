import express from "express";
import { 
    getDailyReport,
    getWeeklyReport,
    getMonthlyReport,
    getMonthlyAccountReport
} from "../controllers/report.controller.js";

const router = express.Router();

router.get("/daily", getDailyReport);
router.get("/weekly", getWeeklyReport);
router.get("/monthly", getMonthlyReport);
router.get("/account-monthly", getMonthlyAccountReport);

export default router;