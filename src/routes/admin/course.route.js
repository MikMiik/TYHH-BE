const express = require("express");
const adminCourseController = require("@/controllers/admin/course.controller");
const { requirePermission } = require("@/middlewares/checkPermission");
const { PERMISSIONS } = require("@/configs/permissions");
const router = express.Router();

// Admin course management routes with specific permissions
router.get(
  "/",
  requirePermission(PERMISSIONS.ADMIN.COURSES.LIST),
  adminCourseController.getAll
);
router.get(
  "/analytics",
  requirePermission(PERMISSIONS.ADMIN.COURSES.ANALYTICS),
  adminCourseController.getAnalytics
);
router.get(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.COURSES.VIEW),
  adminCourseController.getOne
);
router.post(
  "/",
  requirePermission(PERMISSIONS.ADMIN.COURSES.CREATE),
  adminCourseController.create
);
router.put(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.COURSES.UPDATE),
  adminCourseController.update
);
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.ADMIN.COURSES.DELETE),
  adminCourseController.delete
);

module.exports = router;
