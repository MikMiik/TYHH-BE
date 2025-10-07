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

exports.createCourse = async (req, res) => {
  try {
    const teacherId = req.user.id; // Get teacher ID from authenticated user
    const courseData = req.body;

    // Validate required fields
    if (!courseData.title) {
      return res.error(400, "Title is required");
    }

    const newCourse = await courseService.createCourse(courseData, teacherId);
    res.success(201, newCourse, "Course created successfully");
  } catch (error) {
    res.error(500, error.message);
  }
};

exports.delete = async (req, res) => {
  await courseService.deleteCourse(req.params.id);
  res.success(200, null, "Course deleted successfully");
};
