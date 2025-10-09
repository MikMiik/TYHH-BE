const router = require("express").Router();
const courseOutlineController = require("@/controllers/api/courseOutline.controller");
const courseOutlineValidator = require("@/validators/courseOutline.validator");

// Create new outline
router.post(
  "/",
  courseOutlineValidator.create,
  courseOutlineController.createOutline
);

// Get outlines by course
router.get("/course/:courseId", courseOutlineController.getOutlinesByCourse);

// Get single outline by ID or slug
router.get("/:id", courseOutlineController.getOutlineById);

// Update outline
router.put(
  "/:id",
  courseOutlineValidator.update,
  courseOutlineController.updateOutline
);

// Delete outline
router.delete("/:id", courseOutlineController.deleteOutline);

// Reorder outlines
router.patch(
  "/course/:courseId/reorder",
  courseOutlineValidator.reorder,
  courseOutlineController.reorderOutlines
);

module.exports = router;
