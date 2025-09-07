const { Course } = require("@/models");

class CourseService {
  async getAllCourses() {
    const courses = await Course.findAll({
      order: [["name", "ASC"]],
      attributes: ["id", "name"],
    });
    return courses;
  }
  async getCourseById(courseId) {
    const course = await Course.findByPk(courseId, {
      attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      include: [
        { association: "teacher", attributes: ["id", "name", "facebook"] },
      ],
    });
    return course;
  }
}

module.exports = new CourseService();
