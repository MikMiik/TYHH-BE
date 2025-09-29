const express = require("express");
const adminAuthController = require("@/controllers/admin/auth.controller");
const { auth, requireAdmin } = require("@/middlewares/auth");
const router = express.Router();

// Public admin auth routes (no middleware)
router.post("/login", adminAuthController.login);
router.post("/logout", adminAuthController.logout);
router.post("/refresh-token", adminAuthController.refreshToken);

// Protected admin auth routes (require admin)
router.get("/me", auth, requireAdmin, adminAuthController.me);

module.exports = router;
