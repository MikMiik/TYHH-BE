const express = require("express");
const adminCourseOutlineController = require("@/controllers/admin/courseOutline.controller");
const courseOutlineValidator = require("@/validators/admin/courseOutline.validator");
const router = express.Router();

// Admin course outline management routes
// General routes
router.get("/", adminCourseOutlineController.getAllOutlines); // Get all outlines across all courses

// Routes for specific course outlines
router.get("/course/:courseId", adminCourseOutlineController.getAll);
router.post(
  "/course/:courseId",
  courseOutlineValidator.create,
  adminCourseOutlineController.create
);
router.put("/course/:courseId/reorder", adminCourseOutlineController.reorder);

// Routes for individual outlines
router.get("/:id", adminCourseOutlineController.getOne);
router.put(
  "/:id",
  courseOutlineValidator.update,
  adminCourseOutlineController.update
);
router.delete("/:id", adminCourseOutlineController.delete);
router.post("/bulk-delete", adminCourseOutlineController.bulkDelete);

module.exports = router;
