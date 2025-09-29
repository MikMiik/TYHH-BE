const express = require("express");
const adminCourseController = require("@/controllers/admin/course.controller");
const router = express.Router();

// Admin course management routes (admin bypass applies)
router.get("/", adminCourseController.getAll);
router.get("/analytics", adminCourseController.getAnalytics);
router.get("/:id", adminCourseController.getOne);
router.post("/", adminCourseController.create);
router.put("/:id", adminCourseController.update);
router.delete("/:id", adminCourseController.delete);

module.exports = router;
