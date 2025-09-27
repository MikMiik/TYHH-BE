const express = require("express");
const adminDashboardController = require("@/controllers/admin/dashboard.controller");
const { requirePermission } = require("@/middlewares/checkPermission");
const { PERMISSIONS } = require("@/configs/permissions");
const router = express.Router();

// Dashboard analytics routes with specific permissions
router.get(
  "/",
  requirePermission(PERMISSIONS.ADMIN.DASHBOARD.VIEW),
  adminDashboardController.getDashboard
);
router.get(
  "/overview",
  requirePermission(PERMISSIONS.ADMIN.DASHBOARD.OVERVIEW),
  adminDashboardController.getOverview
);
router.get(
  "/users",
  requirePermission(PERMISSIONS.ADMIN.DASHBOARD.USER_ANALYTICS),
  adminDashboardController.getUserAnalytics
);
router.get(
  "/courses",
  requirePermission(PERMISSIONS.ADMIN.DASHBOARD.COURSE_ANALYTICS),
  adminDashboardController.getCourseAnalytics
);
router.get(
  "/livestreams",
  requirePermission(PERMISSIONS.ADMIN.DASHBOARD.LIVESTREAM_ANALYTICS),
  adminDashboardController.getLivestreamAnalytics
);
router.get(
  "/documents",
  requirePermission(PERMISSIONS.ADMIN.DASHBOARD.DOCUMENT_ANALYTICS),
  adminDashboardController.getDocumentAnalytics
);
router.get(
  "/growth",
  requirePermission(PERMISSIONS.ADMIN.DASHBOARD.GROWTH_ANALYTICS),
  adminDashboardController.getGrowthAnalytics
);

module.exports = router;
