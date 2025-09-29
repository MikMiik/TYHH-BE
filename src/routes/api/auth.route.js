const express = require("express");
const authController = require("@/controllers/api/auth.controller");
const router = express.Router();
const authValidator = require("@/validators/auth.validator");
const { requirePermission } = require("@/middlewares/auth");
const { validateUserOwnership } = require("@/middlewares/validateOwnership");
const { PERMISSIONS } = require("@/configs/permissions");

// Public auth routes - không cần permission
router.post("/login", authValidator.login, authController.login);
router.post("/google", authController.googleLogin);
router.post("/register", authValidator.register, authController.register);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/verify-email", authController.verifyEmail);
router.post("/reset-password", authController.resetPassword);
router.post("/forgot-password", authController.sendForgotEmail);
router.get("/verify-reset-token", authController.verifyResetToken);

// Protected auth routes - cần authentication và permission
router.get(
  "/me",
  requirePermission(PERMISSIONS.USER.PROFILE.VIEW),
  authController.me
);

router.post(
  "/change-password/:userId",
  requirePermission(PERMISSIONS.USER.PROFILE.UPDATE),
  validateUserOwnership("userId"),
  authValidator.changePassword,
  authController.changePassword
);

router.post(
  "/change-email",
  requirePermission(PERMISSIONS.USER.PROFILE.UPDATE),
  authValidator.changeEmail,
  authController.changeEmail
);

router.post(
  "/check-key",
  requirePermission(PERMISSIONS.USER.PROFILE.VIEW),
  authController.checkKey
);

module.exports = router;
