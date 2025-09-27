const express = require("express");
const adminDocumentController = require("@/controllers/admin/document.controller");
const { requirePermission } = require("@/middlewares/checkPermission");
const { PERMISSIONS } = require("@/configs/permissions");
const router = express.Router();

// Admin document management routes with specific permissions
router.get(
  "/",
  requirePermission(PERMISSIONS.ADMIN.DOCUMENTS.LIST),
  adminDocumentController.getAll
);
router.get(
  "/analytics",
  requirePermission(PERMISSIONS.ADMIN.DOCUMENTS.ANALYTICS),
  adminDocumentController.getAnalytics
);
router.get(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.DOCUMENTS.VIEW),
  adminDocumentController.getOne
);
router.post(
  "/",
  requirePermission(PERMISSIONS.ADMIN.DOCUMENTS.CREATE),
  adminDocumentController.create
);
router.put(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.DOCUMENTS.UPDATE),
  adminDocumentController.update
);
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.DOCUMENTS.DELETE),
  adminDocumentController.delete
);

module.exports = router;
