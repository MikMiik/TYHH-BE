const express = require("express");
const userController = require("@/controllers/api/user.controller");
const userValidator = require("@/validators/user.validator");
const checkAuth = require("@/middlewares/checkAuth");
const { requirePermission } = require("@/middlewares/checkPermission");
const { validateUserOwnership } = require("@/middlewares/validateOwnership");
const { PERMISSIONS } = require("@/configs/permissions");
const router = express.Router();

// User profile routes với authentication và ownership validation
router.post(
  "/:id/upload-avatar",
  checkAuth,
  requirePermission(PERMISSIONS.USER.PROFILE.UPLOAD_AVATAR),
  validateUserOwnership("id"),
  userController.uploadAvatar
);

router.get(
  "/my-courses",
  checkAuth,
  requirePermission(PERMISSIONS.USER.COURSES.VIEW_ENROLLED),
  userController.getMyCourses
);

router.put(
  "/:id",
  checkAuth,
  requirePermission(PERMISSIONS.USER.PROFILE.UPDATE),
  validateUserOwnership("id"),
  userValidator.updateProfile,
  userController.updateProfile
);

router.patch(
  "/:id",
  checkAuth,
  requirePermission(PERMISSIONS.USER.PROFILE.UPDATE),
  validateUserOwnership("id"),
  userValidator.updateProfile,
  userController.updateProfile
);

router.get(
  "/:id",
  checkAuth,
  requirePermission(PERMISSIONS.USER.PROFILE.VIEW),
  validateUserOwnership("id"),
  userController.getProfile
);

module.exports = router;
