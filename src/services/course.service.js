const { Course, Topic, CourseTopic, sequelize } = require("@/models");

class CourseService {
  async getAllCourses({ limit, offset, topic, sort = "newest" }) {
    let whereClause = {};
    if (topic) {
      const topicInstance = await Topic.findOne({ where: { slug: topic } });
      if (topicInstance) {
        const courseTopics = await CourseTopic.findAll({
          where: { topicId: topicInstance.id },
          attributes: ["courseId"],
        });
        const courseIds = courseTopics.map((ct) => ct.courseId);
        if (courseIds.length === 0) {
          return [];
        }
        whereClause.id = courseIds;
      } else {
        return [];
      }
    }

    // Xử lý sort order
    let orderClause = [];
    switch (sort) {
      case "oldest":
        orderClause = [["createdAt", "ASC"]];
        break;
      case "popularity":
        orderClause = [
          [sequelize.literal("totalView"), "DESC"],
          ["createdAt", "DESC"],
        ];
        break;
      case "newest":
      default:
        orderClause = [["createdAt", "DESC"]];
        break;
    }

    const { count, rows: courses } = await Course.findAndCountAll({
      limit,
      offset,
      where: whereClause,
      order: orderClause,
      distinct: true,
      attributes: [
        "id",
        "title",
        "slug",
        "teacherId",
        "thumbnail",
        "price",
        "discount",
        "isFree",
        "createdAt",
        [
          sequelize.literal(`(
            SELECT COALESCE(SUM(livestreams.view), 0)
            FROM livestreams
            WHERE livestreams.courseId = Course.id
          )`),
          "totalView",
        ],
      ],
      include: [{ association: "teacher", attributes: ["id", "name"] }],
    });

    const totalPages = Math.ceil(count / limit);
    // Nếu page vượt quá totalPages thì trả về mảng rỗng
    if (offset / limit + 1 > totalPages) {
      return { courses: [], totalPages };
    }
    return { courses, totalPages };
  }
  async getCourseBySlug(slug) {
    const course = await Course.findOne({
      where: { slug },
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
              attributes: ["id", "title", "slug", "url", "view"],
              separate: true,
              order: [["order", "ASC"]],
              include: [
                {
                  association: "documents",
                  attributes: ["id", "slug"],
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
