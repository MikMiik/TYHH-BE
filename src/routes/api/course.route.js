const express = require("express");
const router = express.Router();
const courseController = require("@/controllers/api/course.controller");
const { smartPermission } = require("@/middlewares/smartPermission");
const { PERMISSIONS } = require("@/configs/permissions");

// Public course routes với smart permission (hybrid approach)
// Tự động detect public route và handle permission appropriately
router.get(
  "/",
  smartPermission(PERMISSIONS.PUBLIC.COURSES.LIST, { trackPublicAccess: true }),
  courseController.getAll
);

router.get(
  "/:slug",
  smartPermission(PERMISSIONS.PUBLIC.COURSES.VIEW, { trackPublicAccess: true }),
  courseController.getOne
);

module.exports = router;
