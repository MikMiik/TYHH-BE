const courseService = require("@/services/course.service");

exports.getAll = async (req, res) => {
  const { limit = 10, page = 1, topic, sort = "newest" } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;
  const data = await courseService.getAllCourses({
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
    topic,
    sort,
  });
  res.success(200, data);
};

exports.getOne = async (req, res) => {
  const course = await courseService.getCourseBySlug(req.params.slug);
  res.success(200, course);
};
