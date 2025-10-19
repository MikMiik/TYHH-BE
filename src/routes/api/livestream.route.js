const express = require("express");
const router = express.Router();
const livestreamController = require("@/controllers/api/livestream.controller");
const livestreamValidator = require("@/validators/livestream.validator");
const trackLivestreamView = require("@/middlewares/trackLivestreamView");
const checkCourseAccess = require("@/middlewares/checkCourseAccess");
const { requireTeacher } = require("@/middlewares/auth");

// Protected routes - require authentication (must be before dynamic routes)
router.post(
  "/teacher/create",
  requireTeacher,
  livestreamValidator.create,
  livestreamController.create
);

router.put(
  "/teacher/:id",
  requireTeacher,
  livestreamValidator.update,
  livestreamController.update
);

router.delete(
  "/teacher/:id",
  requireTeacher,
  livestreamValidator.delete,
  livestreamController.delete
);

router.post(
  "/teacher/reorder",
  requireTeacher,
  livestreamValidator.reorder,
  livestreamController.reorder
);

// Protected livestream routes - requires authentication and enrollment
router.get("/:slug", checkCourseAccess, livestreamController.getOne);

// Track view khi user click play video - also requires enrollment
router.post("/:slug/view", checkCourseAccess, trackLivestreamView, livestreamController.trackView);

module.exports = router;
