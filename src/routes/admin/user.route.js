const express = require("express");
const adminUserController = require("@/controllers/admin/user.controller");
const adminUserValidator = require("@/validators/admin/user.validator");
const { requirePermission } = require("@/middlewares/checkPermission");
const { PERMISSIONS } = require("@/configs/permissions");
const router = express.Router();

// Admin user management routes with specific permissions
router.get(
  "/",
  requirePermission(PERMISSIONS.ADMIN.USERS.LIST),
  adminUserController.getAll
);
router.get(
  "/analytics",
  requirePermission(PERMISSIONS.ADMIN.USERS.ANALYTICS),
  adminUserController.getAnalytics
);
router.get(
  "/:id",
  adminUserValidator.validateId,
  requirePermission(PERMISSIONS.ADMIN.USERS.VIEW),
  adminUserController.getOne
);
router.get(
  "/username/:username",
  requirePermission(PERMISSIONS.ADMIN.USERS.VIEW),
  adminUserController.getByUsername
);
router.post(
  "/",
  adminUserValidator.register,
  requirePermission(PERMISSIONS.ADMIN.USERS.CREATE),
  adminUserController.create
);
router.put(
  "/:id",
  adminUserValidator.validateId,
  adminUserValidator.update,
  requirePermission(PERMISSIONS.ADMIN.USERS.UPDATE),
  adminUserController.update
);
router.delete(
  "/:id",
  adminUserValidator.validateId,
  requirePermission(PERMISSIONS.ADMIN.USERS.DELETE),
  adminUserController.delete
);
router.patch(
  "/:id/status",
  adminUserValidator.validateId,
  requirePermission(PERMISSIONS.ADMIN.USERS.TOGGLE_STATUS),
  adminUserController.toggleStatus
);
router.post(
  "/:id/set-key",
  adminUserValidator.validateId,
  requirePermission(PERMISSIONS.ADMIN.USERS.SET_KEY),
  adminUserController.setKey
);
router.post(
  "/:id/send-verification",
  adminUserValidator.validateId,
  requirePermission(PERMISSIONS.ADMIN.USERS.SEND_VERIFICATION),
  adminUserController.sendVerificationEmail
);

module.exports = router;
