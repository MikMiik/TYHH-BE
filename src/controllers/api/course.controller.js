const courseService = require("@/services/course.service");

exports.getAll = async (req, res) => {
  const {
    limit = 10,
    page = 1,
    topic,
    sort = "newest",
    search = "",
  } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;
  const data = await courseService.getAllCourses({
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
    topic,
    sort,
    search,
  });
  res.success(200, data);
};

exports.getOne = async (req, res) => {
  const course = await courseService.getCourseBySlug(req.params.slug);
  res.success(200, course);
};

exports.getCreatedCourses = async (req, res) => {
  const teacherId = req.user.id; // Get teacher ID from authenticated user
  const { limit = 10, page = 1, search = "" } = req.query;

  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;

  const data = await courseService.getCreatedCourses(teacherId, {
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
    search,
  });

  res.success(200, data);
};
