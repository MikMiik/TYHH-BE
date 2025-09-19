const adminCourseService = require("@/services/admin/course.service");

exports.getAll = async (req, res) => {
  const { page = 1, limit = 10, search, status, topic } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;

  const data = await adminCourseService.getAllCourses({
    page: pageNum,
    limit: limitNum,
    search,
    status,
    topic,
  });

  res.success(200, data);
};

exports.getOne = async (req, res) => {
  const course = await adminCourseService.getCourseById(req.params.id);
  res.success(200, course);
};

exports.create = async (req, res) => {
  const courseData = req.body;
  const course = await adminCourseService.createCourse(courseData);
  res.success(201, course, "Course created successfully");
};

exports.update = async (req, res) => {
  const courseData = req.body;
  const course = await adminCourseService.updateCourse(
    req.params.id,
    courseData
  );
  res.success(200, course, "Course updated successfully");
};

exports.delete = async (req, res) => {
  await adminCourseService.deleteCourse(req.params.id);
  res.success(200, null, "Course deleted successfully");
};

exports.getAnalytics = async (req, res) => {
  const analytics = await adminCourseService.getCoursesAnalytics();
  res.success(200, analytics);
};
