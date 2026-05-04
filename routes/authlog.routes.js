const express = require("express");
const authLogController = require("../controllers/authlog.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.post("/", protect, authLogController.createAuthLog);
router.get("/", protect, authLogController.getAllAuthLogs);
router.get("/:id", protect, authLogController.getAuthLogById);
router.put("/:id", protect, authLogController.updateAuthLog);
router.delete("/:id", protect, authLogController.deleteAuthLog);

module.exports = router;
