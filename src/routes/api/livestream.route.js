const express = require("express");
const router = express.Router();
const livestreamController = require("@/controllers/api/livestream.controller");
const livestreamValidator = require("@/validators/livestream.validator");
const trackLivestreamView = require("@/middlewares/trackLivestreamView");

// Protected routes - require authentication (must be before dynamic routes)
router.post(
  "/teacher/create",
  livestreamValidator.create,
  livestreamController.create
);

// Public livestream routes - handled by auth middleware automatically
router.get("/:slug", livestreamController.getOne);

// Track view khi user click play video
router.post("/:slug/view", trackLivestreamView, livestreamController.trackView);

module.exports = router;
