const express = require("express");
const router = express.Router();
const scheduleController = require("@/controllers/api/schedule.controller");

router.get("/", scheduleController.getAll);

module.exports = router;
