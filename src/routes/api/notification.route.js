const express = require("express");
const router = express.Router();
const notificationController = require("@/controllers/api/notification.controller");
const notificationValidator = require("@/validators/notification.validator");

// Public routes - get all notifications
router.get("/", notificationController.getAll);

// Protected routes - require authentication (teacher routes)
router.post(
  "/teacher/create",
  notificationValidator.create,
  notificationController.create
);

router.get(
  "/teacher/:teacherId",
  notificationValidator.getByTeacher,
  notificationController.getByTeacher
);

router.delete(
  "/teacher/:id",
  notificationValidator.delete,
  notificationController.delete
);

module.exports = router;
