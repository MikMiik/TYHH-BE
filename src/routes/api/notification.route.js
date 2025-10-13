const express = require("express");
const router = express.Router();
const notificationController = require("@/controllers/api/notification.controller");
const notificationValidator = require("@/validators/notification.validator");
const { requireTeacher } = require("@/middlewares/auth");

// Public routes - get all notifications
router.get("/", notificationController.getAll);

// Protected routes - require authentication (teacher routes)
router.post(
  "/teacher/create",
  requireTeacher,
  notificationValidator.create,
  notificationController.create
);

router.get(
  "/teacher/:teacherId",
  requireTeacher,
  notificationValidator.getByTeacher,
  notificationController.getByTeacher
);

router.delete(
  "/teacher/:id",
  requireTeacher,
  notificationValidator.delete,
  notificationController.delete
);

// Mark notification as read
router.post(
  "/:id/mark-read",
  notificationValidator.markAsRead,
  notificationController.markAsRead
);

// Mark all notifications as read
router.post("/mark-all-read", notificationController.markAllAsRead);

module.exports = router;
