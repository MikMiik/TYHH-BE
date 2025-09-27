const express = require("express");
const router = express.Router();
const socialController = require("@/controllers/api/social.controller");
const { smartPermission } = require("@/middlewares/smartPermission");
const { PERMISSIONS } = require("@/configs/permissions");

// Public social routes với permission tracking
router.get(
  "/",
  smartPermission(PERMISSIONS.PUBLIC.SOCIALS.LIST, { trackPublicAccess: true }),
  socialController.getAll
);

module.exports = router;
