const express = require("express");
const userController = require("@/controllers/api/user.controller");
const userValidator = require("@/validators/user.validator");
const router = express.Router();

router.post("/:id/upload-avatar", userController.uploadAvatar);
router.put("/:id", userValidator.updateProfile, userController.updateProfile);
router.patch("/:id", userValidator.updateProfile, userController.updateProfile);
router.get("/:id", userController.getProfile);

module.exports = router;
