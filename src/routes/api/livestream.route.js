const express = require("express");
const router = express.Router();
const livestreamController = require("@/controllers/api/livestream.controller");
const livestreamValidator = require("@/validators/livestream.validator");
const trackLivestreamView = require("@/middlewares/trackLivestreamView");
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

// Public livestream routes - handled by auth middleware automatically
router.get("/:slug", livestreamController.getOne);

// Track view khi user click play video
router.post("/:slug/view", trackLivestreamView, livestreamController.trackView);

module.exports = router;
