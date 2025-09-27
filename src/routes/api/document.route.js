const express = require("express");
const router = express.Router();
const documentController = require("@/controllers/api/document.controller");
const { smartPermission } = require("@/middlewares/smartPermission");
const { PERMISSIONS } = require("@/configs/permissions");

// Public document routes với smart permission
router.get(
  "/",
  smartPermission(PERMISSIONS.PUBLIC.DOCUMENTS.LIST, {
    trackPublicAccess: true,
  }),
  documentController.getAll
);

router.get(
  "/:slug",
  smartPermission(PERMISSIONS.PUBLIC.DOCUMENTS.VIEW, {
    trackPublicAccess: true,
  }),
  documentController.getOne
);

module.exports = router;
