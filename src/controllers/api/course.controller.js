const courseService = require("@/services/course.service");
const throw404 = require("@/utils/throw404");

exports.getOne = async (req, res) => {
  const course = await courseService.getCourseById(req.params.id);
  if (!course) throw404("Course not found");
  res.success(200, course);
};
