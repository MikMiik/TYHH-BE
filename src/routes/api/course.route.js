const express = require("express");
const router = express.Router();
const courseController = require("@/controllers/api/course.controller");
const courseValidator = require("@/validators/course.validator");

// Protected routes - require authentication (must be before dynamic routes)
router.get("/teacher/created-courses", courseController.getCreatedCourses);
router.post(
  "/teacher/create",
  courseValidator.createCourse,
  courseController.createCourse
);
router.put("/teacher/:id", courseValidator.editCourse, courseController.update);
router.delete("/teacher/:id", courseController.delete);

// Public course routes - handled by auth middleware automatically
router.get("/", courseController.getAll);
router.get("/:slug", courseController.getOne);
module.exports = router;
