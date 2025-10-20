const courseService = require("@/services/course.service");

exports.getAll = async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    teacherId,
    isFree,
    topicId,
  } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;

  // Parse boolean parameter properly
  let isFreeParam = undefined;
  if (isFree === "true") isFreeParam = true;
  else if (isFree === "false") isFreeParam = false;

  const data = await courseService.getAllCoursesAdmin({
    page: pageNum,
    limit: limitNum,
    search,
    teacherId: teacherId ? parseInt(teacherId) : undefined,
    isFree: isFreeParam,
    topicId: topicId ? parseInt(topicId) : undefined,
  });

  res.success(200, data);
};

exports.getOne = async (req, res) => {
  const course = await courseService.getCourseById(req.params.id);
  res.success(200, course);
};

exports.create = async (req, res) => {
  const courseData = req.body;
  const course = await courseService.createCourse(courseData);
  res.success(201, course, "Course created successfully");
};

exports.update = async (req, res) => {
  const courseData = req.body;
  const course = await courseService.updateCourse(req.params.id, courseData);
  res.success(200, course, "Course updated successfully");
};

exports.delete = async (req, res) => {
  await courseService.deleteCourse(req.params.id);
  res.success(200, null, "Course deleted successfully");
};

exports.bulkDelete = async (req, res) => {
  const { ids } = req.body;
  const result = await courseService.bulkDeleteCourses(ids);
  res.success(200, result, result.message);
};

exports.getAnalytics = async (req, res) => {
  const analytics = await courseService.getCoursesAnalytics();
  res.success(200, analytics);
};

exports.removeStudent = async (req, res) => {
  const { courseId, userId } = req.params;
  await courseService.removeStudentFromCourse(courseId, userId);
  res.success(200, null, "Student removed from course successfully");
};

exports.updateTeacher = async (req, res) => {
  const { courseId } = req.params;
  const { teacherId } = req.body;
  const course = await courseService.updateCourseTeacher(courseId, teacherId);
  res.success(200, course, "Course teacher updated successfully");
};

exports.updateTopics = async (req, res) => {
  const { courseId } = req.params;
  const { topicIds } = req.body;
  const course = await courseService.updateCourseTopics(courseId, topicIds);
  res.success(200, course, "Course topics updated successfully");
};

exports.getTeachers = async (req, res) => {
  const teachers = await courseService.getAllTeachers();
  res.success(200, teachers);
};
