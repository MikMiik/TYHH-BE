const express = require("express");
const adminUserController = require("@/controllers/admin/user.controller");
const adminCourseController = require("@/controllers/admin/course.controller");
const adminLivestreamController = require("@/controllers/admin/livestream.controller");
const checkAuth = require("@/middlewares/checkAuth");
const adminUserValidator = require("@/validators/admin/user.validator");
const router = express.Router();

// Middleware kiểm tra quyền admin cho tất cả routes
router.use(checkAuth);
router.use((req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.error(403, "Access denied. Admin role required.");
  }
  next();
});

// Admin user management routes
router.get("/users", adminUserController.getAll);
router.get("/users/analytics", adminUserController.getAnalytics);
router.get(
  "/users/:id",
  adminUserValidator.validateId,
  adminUserController.getOne
);
router.get("/users/username/:username", adminUserController.getByUsername);
router.post("/users", adminUserValidator.register, adminUserController.create);
router.put(
  "/users/:id",
  adminUserValidator.validateId,
  adminUserValidator.update,
  adminUserController.update
);
router.delete(
  "/users/:id",
  adminUserValidator.validateId,
  adminUserController.delete
);
router.patch(
  "/users/:id/status",
  adminUserValidator.validateId,
  adminUserController.toggleStatus
);
router.post(
  "/users/:id/set-key",
  adminUserValidator.validateId,
  adminUserController.setKey
);
router.post(
  "/users/:id/send-verification",
  adminUserValidator.validateId,
  adminUserController.sendVerificationEmail
);

// Admin course management routes
router.get("/courses", adminCourseController.getAll);
router.get("/courses/analytics", adminCourseController.getAnalytics);
router.get("/courses/:id", adminCourseController.getOne);
router.post("/courses", adminCourseController.create);
router.put("/courses/:id", adminCourseController.update);
router.delete("/courses/:id", adminCourseController.delete);

// Admin livestream management routes
router.get("/livestreams", adminLivestreamController.getAll);
router.get("/livestreams/analytics", adminLivestreamController.getAnalytics);
router.get("/livestreams/:id", adminLivestreamController.getOne);
router.post("/livestreams", adminLivestreamController.create);
router.put("/livestreams/:id", adminLivestreamController.update);
router.delete("/livestreams/:id", adminLivestreamController.delete);

module.exports = router;
