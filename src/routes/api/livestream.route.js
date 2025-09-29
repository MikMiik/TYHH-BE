const express = require("express");
const router = express.Router();
const livestreamController = require("@/controllers/api/livestream.controller");
const trackLivestreamView = require("@/middlewares/trackLivestreamView");

// Public livestream routes - handled by auth middleware automatically
router.get("/:slug", livestreamController.getOne);

// Track view khi user click play video
router.post("/:slug/view", trackLivestreamView, livestreamController.trackView);

module.exports = router;
