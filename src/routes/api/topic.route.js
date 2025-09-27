const express = require("express");
const router = express.Router();
const topicController = require("@/controllers/api/topic.controller");
const { smartPermission } = require("@/middlewares/smartPermission");
const { PERMISSIONS } = require("@/configs/permissions");

// Public topic routes với smart permission
router.get(
  "/",
  smartPermission(PERMISSIONS.PUBLIC.TOPICS.LIST, { trackPublicAccess: true }),
  topicController.getAll
);

module.exports = router;
