const express = require("express");
const router = express.Router();
const scheduleController = require("@/controllers/api/schedule.controller");

// Public schedule routes - handled by auth middleware automatically
router.get("/", scheduleController.getAll);

module.exports = router;
