const courseOutlineService = require("@/services/courseOutline.service");

// Create new course outline
exports.createOutline = async (req, res) => {
  const { title, courseId } = req.body;

  const outline = await courseOutlineService.createOutline({
    title,
    courseId: parseInt(courseId),
  });

  res.success(201, outline, "Course outline created successfully");
};

// Get all outlines for a specific course
exports.getOutlinesByCourse = async (req, res) => {
  const { courseId } = req.params;
  const { page = 1, limit = 10, search } = req.query;

  const result = await courseOutlineService.getAllOutlines({
    courseId: parseInt(courseId),
    page: parseInt(page),
    limit: parseInt(limit),
    search,
  });

  res.success(200, result, "Course outlines retrieved successfully");
};

// Get single outline by ID or slug
exports.getOutlineById = async (req, res) => {
  const { id } = req.params;
  const outline = await courseOutlineService.getOutlineById(id);

  res.success(200, outline, "Course outline retrieved successfully");
};

// Update outline
exports.updateOutline = async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  const outline = await courseOutlineService.updateOutline(id, { title });

  res.success(200, outline, "Course outline updated successfully");
};

// Delete outline
exports.deleteOutline = async (req, res) => {
  const { id } = req.params;

  await courseOutlineService.deleteOutline(id);

  res.success(200, null, "Course outline deleted successfully");
};

// Reorder outlines
exports.reorderOutlines = async (req, res) => {
  const { courseId } = req.params;
  const { orders } = req.body;

  await courseOutlineService.reorderOutlines(parseInt(courseId), orders);

  res.success(200, null, "Course outlines reordered successfully");
};
