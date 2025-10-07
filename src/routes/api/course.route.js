const express = require("express");
const router = express.Router();
const courseController = require("@/controllers/api/course.controller");

// Protected routes - require authentication (must be before dynamic routes)
router.get("/teacher/created-courses", courseController.getCreatedCourses);

// Public course routes - handled by auth middleware automatically
router.get("/", courseController.getAll);
router.get("/:slug", courseController.getOne);

module.exports = router;
