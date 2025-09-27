const express = require("express");
const router = express.Router();
const cityController = require("../../controllers/api/city.controller");
const { smartPermission } = require("@/middlewares/smartPermission");
const { PERMISSIONS } = require("@/configs/permissions");

// Public city routes với smart permission
router.get(
  "/",
  smartPermission(PERMISSIONS.PUBLIC.CITIES.LIST, { trackPublicAccess: true }),
  cityController.getCities
);

module.exports = router;
