import express from "express";
import {
  getSchedule,
  updateSchedule,
} from "../controllers/alertSchedule.controller.js";
import { protect } from "../middleware/auth.middleware.js"; 

const router = express.Router();

router.get("/", protect, getSchedule);     
router.post("/", protect, updateSchedule); 

export default router;