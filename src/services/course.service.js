const { Course } = require("@/models");

class CourseService {
  async getAllCourses({ limit, offset }) {
    const courses = await Course.findAll({
      limit,
      offset,
      attributes: [
        "id",
        "title",
        "teacherId",
        "thumbnail",
        "price",
        "discount",
        "isFree",
      ],
      include: [{ association: "teacher", attributes: ["id", "name"] }],
    });
    return courses;
  }
  async getCourseById(courseId) {
    const course = await Course.findByPk(courseId, {
      attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      include: [
        { association: "teacher", attributes: ["id", "name", "facebook"] },
        {
          association: "outlines",
          attributes: ["id", "title"],
          separate: true,
          order: [["order", "ASC"]],
          include: [
            {
              association: "livestreams",
              attributes: ["id", "title", "url", "view"],
              separate: true,
              order: [["order", "ASC"]],
              include: [
                {
                  association: "documents",
                  attributes: ["id", "url"],
                },
              ],
            },
          ],
        },
      ],
    });
    return course;
  }
}

module.exports = new CourseService();
