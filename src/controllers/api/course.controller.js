const courseService = require("@/services/course.service");

exports.getAll = async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;
  const courses = await courseService.getAllCourses({
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
  });
  res.success(200, courses);
};

exports.getOne = async (req, res) => {
  const course = await courseService.getCourseById(req.params.id);
  res.success(200, course);
};
