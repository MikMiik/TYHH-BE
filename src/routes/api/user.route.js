const express = require("express");
const userController = require("@/controllers/api/user.controller");
const userValidator = require("@/validators/user.validator");
const { requirePermission } = require("@/middlewares/auth");
const { validateUserOwnership } = require("@/middlewares/validateOwnership");
const { PERMISSIONS } = require("@/configs/permissions");
const router = express.Router();

// User profile routes với authentication và ownership validation
router.post(
  "/:id/upload-avatar",
  requirePermission(PERMISSIONS.USER.PROFILE.UPLOAD_AVATAR),
  validateUserOwnership("id"),
  userController.uploadAvatar
);

router.get(
  "/my-courses",
  requirePermission(PERMISSIONS.USER.COURSES.VIEW_ENROLLED),
  userController.getMyCourses
);

router.get("/students", userController.getAllStudents);

router.put(
  "/:id",
  requirePermission(PERMISSIONS.USER.PROFILE.UPDATE),
  validateUserOwnership("id"),
  userValidator.updateProfile,
  userController.updateProfile
);

router.patch(
  "/:id",
  requirePermission(PERMISSIONS.USER.PROFILE.UPDATE),
  validateUserOwnership("id"),
  userValidator.updateProfile,
  userController.updateProfile
);

router.get(
  "/:id",
  requirePermission(PERMISSIONS.USER.PROFILE.VIEW),
  validateUserOwnership("id"),
  userController.getProfile
);

module.exports = router;
