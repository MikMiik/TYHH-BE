const courseOutlineService = require("@/services/courseOutline.service");

exports.getAllOutlines = async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;

  const data = await courseOutlineService.getAllOutlinesAcrossCourses({
    page: pageNum,
    limit: limitNum,
    search,
  });

  res.success(200, data);
};

exports.getAll = async (req, res) => {
  const { courseId } = req.params;
  const { page = 1, limit = 10, search } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;

  const data = await courseOutlineService.getAllOutlines({
    courseId: parseInt(courseId),
    page: pageNum,
    limit: limitNum,
    search,
  });

  res.success(200, data);
};

exports.getOne = async (req, res) => {
  const { id } = req.params;
  const outline = await courseOutlineService.getOutlineById(id);
  res.success(200, outline);
};

exports.create = async (req, res) => {
  const { courseId } = req.params;
  const outlineData = { ...req.body, courseId: parseInt(courseId) };
  const outline = await courseOutlineService.createOutline(outlineData);
  res.success(201, outline, "Course outline created successfully");
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const outlineData = req.body;
  const outline = await courseOutlineService.updateOutline(id, outlineData);
  res.success(200, outline, "Course outline updated successfully");
};

exports.delete = async (req, res) => {
  const { id } = req.params;
  await courseOutlineService.deleteOutline(id);
  res.success(200, null, "Course outline deleted successfully");
};

exports.bulkDelete = async (req, res) => {
  const { ids } = req.body;
  const result = await courseOutlineService.bulkDeleteOutlines(ids);
  res.success(200, result, result.message);
};

exports.reorder = async (req, res) => {
  const { courseId } = req.params;
  const { orders } = req.body;
  await courseOutlineService.reorderOutlines(courseId, orders);
  res.success(200, null, "Course outlines reordered successfully");
};
