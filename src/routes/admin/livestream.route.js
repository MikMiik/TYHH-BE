const express = require("express");
const adminLivestreamController = require("@/controllers/admin/livestream.controller");
const { requirePermission } = require("@/middlewares/checkPermission");
const { PERMISSIONS } = require("@/configs/permissions");
const router = express.Router();

// Admin livestream management routes with specific permissions
router.get(
  "/",
  requirePermission(PERMISSIONS.ADMIN.LIVESTREAMS.LIST),
  adminLivestreamController.getAll
);
router.get(
  "/analytics",
  requirePermission(PERMISSIONS.ADMIN.LIVESTREAMS.ANALYTICS),
  adminLivestreamController.getAnalytics
);
router.get(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.LIVESTREAMS.VIEW),
  adminLivestreamController.getOne
);
router.post(
  "/",
  requirePermission(PERMISSIONS.ADMIN.LIVESTREAMS.CREATE),
  adminLivestreamController.create
);
router.put(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.LIVESTREAMS.UPDATE),
  adminLivestreamController.update
);
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.LIVESTREAMS.DELETE),
  adminLivestreamController.delete
);

module.exports = router;
