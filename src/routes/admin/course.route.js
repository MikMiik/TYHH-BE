const express = require("express");
const adminCourseController = require("@/controllers/admin/course.controller");
const courseOutlineController = require("@/controllers/admin/courseOutline.controller");
const courseValidator = require("@/validators/admin/course.validator");
const courseOutlineValidator = require("@/validators/admin/courseOutline.validator");
const router = express.Router();

// Admin course management routes (admin bypass applies)
router.get("/", adminCourseController.getAll);
router.get("/analytics", adminCourseController.getAnalytics);
router.get("/teachers", adminCourseController.getTeachers);
router.get("/:id", adminCourseController.getOne);
router.post("/", courseValidator.create, adminCourseController.create);
router.put("/:id", courseValidator.update, adminCourseController.update);
router.delete("/:id", adminCourseController.delete);
router.post("/bulk-delete", adminCourseController.bulkDelete);

// Course outline management routes (nested under course)
// GET /admin/courses/:courseId/outlines - Get all outlines for a course
router.get("/:courseId/outlines", courseOutlineController.getAll);

// GET /admin/courses/outlines/:id - Get single outline
router.get("/outlines/:id", courseOutlineController.getOne);

// POST /admin/courses/:courseId/outlines - Create new outline for a course
router.post(
  "/:courseId/outlines",
  courseOutlineValidator.create,
  courseOutlineController.create
);

// PUT /admin/courses/outlines/:id - Update outline
router.put(
  "/outlines/:id",
  courseOutlineValidator.update,
  courseOutlineController.update
);

// DELETE /admin/courses/outlines/:id - Delete outline
router.delete("/outlines/:id", courseOutlineController.delete);

// PUT /admin/courses/:courseId/outlines/reorder - Reorder outlines
router.put("/:courseId/outlines/reorder", courseOutlineController.reorder);

// DELETE /admin/courses/:courseId/students/:userId - Remove student from course
router.delete(
  "/:courseId/students/:userId",
  adminCourseController.removeStudent
);

// PUT /admin/courses/:courseId/teacher - Update course teacher
router.put("/:courseId/teacher", adminCourseController.updateTeacher);

// PUT /admin/courses/:courseId/topics - Update course topics
router.put("/:courseId/topics", adminCourseController.updateTopics);

module.exports = router;
