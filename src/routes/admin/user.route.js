const express = require("express");
const adminUserController = require("@/controllers/admin/user.controller");
const adminUserValidator = require("@/validators/admin/user.validator");
const router = express.Router();

// Admin user management routes (admin bypass applies)
router.get("/", adminUserController.getAll);
router.get("/analytics", adminUserController.getAnalytics);
router.get("/:id", adminUserValidator.validateId, adminUserController.getOne);
router.get("/username/:username", adminUserController.getByUsername);
router.post("/", adminUserValidator.register, adminUserController.create);
router.put(
  "/:id",
  adminUserValidator.validateId,
  adminUserValidator.update,
  adminUserController.update
);
router.delete(
  "/:id",
  adminUserValidator.validateId,
  adminUserController.delete
);
router.post("/bulk-delete", adminUserController.bulkDelete);
router.patch(
  "/:id/status",
  adminUserValidator.validateId,
  adminUserController.toggleStatus
);
router.post(
  "/:id/set-key",
  adminUserValidator.validateId,
  adminUserController.setKey
);
router.post(
  "/:id/send-verification",
  adminUserValidator.validateId,
  adminUserController.sendVerificationEmail
);

module.exports = router;
