const express = require("express");
const authController = require("@/controllers/api/auth.controller");
const router = express.Router();
const authValidator = require("@/validators/auth.validator");

router.post("/login", authValidator.login, authController.login);
router.post("/google", authController.googleLogin);
router.post("/register", authValidator.register, authController.register);
router.get("/me", authController.me);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/verify-email", authController.verifyEmail);
router.post("/reset-password", authController.resetPassword);
router.post(
  "/change-password/:userId",
  authValidator.changePassword,
  authController.changePassword
);
router.post("/forgot-password", authController.sendForgotEmail);
router.get("/verify-reset-token", authController.verifyResetToken);
router.post(
  "/change-email",
  authValidator.changeEmail,
  authController.changeEmail
);
router.post("/check-key", authController.checkKey);

module.exports = router;
