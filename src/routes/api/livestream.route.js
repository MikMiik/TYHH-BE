const express = require("express");
const router = express.Router();
const livestreamController = require("@/controllers/api/livestream.controller");
const trackLivestreamView = require("@/middlewares/trackLivestreamView");
const { smartPermission } = require("@/middlewares/smartPermission");
const { PERMISSIONS } = require("@/configs/permissions");

// Public livestream routes với smart permission
router.get(
  "/:slug",
  smartPermission(PERMISSIONS.PUBLIC.LIVESTREAMS.VIEW, {
    trackPublicAccess: true,
  }),
  livestreamController.getOne
);

// Track view khi user click play video - smart permission cho tracking
router.post(
  "/:slug/view",
  smartPermission(PERMISSIONS.PUBLIC.LIVESTREAMS.TRACK_VIEW, {
    trackPublicAccess: true,
  }),
  trackLivestreamView,
  livestreamController.trackView
);

module.exports = router;
