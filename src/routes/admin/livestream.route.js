const express = require("express");
const adminLivestreamController = require("@/controllers/admin/livestream.controller");
const livestreamValidator = require("@/validators/admin/livestream.validator");
const router = express.Router();

// Admin livestream management routes (admin bypass applies)
router.get("/", adminLivestreamController.getAll);
router.get("/analytics", adminLivestreamController.getAnalytics);
router.get("/:id", adminLivestreamController.getOne);
router.post("/", livestreamValidator.create, adminLivestreamController.create);
router.put(
  "/:id",
  livestreamValidator.update,
  adminLivestreamController.update
);
router.delete("/:id", adminLivestreamController.delete);

module.exports = router;

module.exports = router;
