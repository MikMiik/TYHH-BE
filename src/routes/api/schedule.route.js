const express = require("express");
const router = express.Router();
const scheduleController = require("@/controllers/api/schedule.controller");
const { smartPermission } = require("@/middlewares/smartPermission");
const { PERMISSIONS } = require("@/configs/permissions");

// Public schedule routes với permission tracking
router.get(
  "/",
  smartPermission(PERMISSIONS.PUBLIC.SCHEDULES.LIST, {
    trackPublicAccess: true,
  }),
  scheduleController.getAll
);

module.exports = router;
