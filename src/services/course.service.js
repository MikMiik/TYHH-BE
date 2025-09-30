const {
  Course,
  Topic,
  CourseTopic,
  User,
  CourseUser,
  CourseOutline,
  sequelize,
} = require("@/models");
const { Op } = require("sequelize");
const { generateUniqueSlug } = require("@/utils/generateUniqueSlug");
const { buildAttributes, buildWhereConditions } = require("./serviceOptions");

class CourseService {
  // API: Get all courses (public, filtered)
  async getAllCourses({ limit, offset, topic, sort = "newest" }) {
    let whereClause = {};

    // Topic filter for API
    if (topic) {
      const topicInstance = await Topic.findOne({ where: { slug: topic } });
      if (topicInstance) {
        const courseTopics = await CourseTopic.findAll({
          where: { topicId: topicInstance.id },
          attributes: ["courseId"],
        });
        const courseIds = courseTopics.map((ct) => ct.courseId);
        if (courseIds.length === 0) {
          return { courses: [], totalPages: 0 };
        }
        whereClause.id = courseIds;
      } else {
        return { courses: [], totalPages: 0 };
      }
    }

    // Sort order
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
    if (offset / limit + 1 > totalPages) {
      return { courses: [], totalPages };
    }
    return { courses, totalPages };
  }

  // API: Get course by slug
  async getCourseBySlug(slug) {
    return await Course.findOne({
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
  }

  // ADMIN: Get all courses (no filters, pagination)
  async getAllCoursesAdmin({
    page = 1,
    limit = 10,
    search,
    teacherId,
    isFree,
    topicId,
  }) {
    const offset = (page - 1) * limit;
    const whereConditions = {};
    const includeConditions = [];

    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (teacherId) whereConditions.teacherId = teacherId;
    if (typeof isFree === "boolean") whereConditions.isFree = isFree;

    // Topic filter
    if (topicId) {
      includeConditions.push({
        model: Topic,
        as: "topics",
        where: { id: topicId },
        attributes: ["id", "title"],
        through: { attributes: [] },
      });
    } else {
      includeConditions.push({
        model: Topic,
        as: "topics",
        attributes: ["id", "title"],
        through: { attributes: [] },
      });
    }

    const { count: total, rows: courses } = await Course.findAndCountAll({
      where: whereConditions,
      attributes: [
        "id",
        "title",
        "slug",
        "description",
        "price",
        "discount",
        "isFree",
        "thumbnail",
        "group",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
        ...includeConditions,
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      distinct: true,
    });

    // Stats
    const [totalFiltered, freeCount, paidCount, topics] = await Promise.all([
      Course.count({ where: whereConditions }),
      Course.count({ where: { ...whereConditions, isFree: true } }),
      Course.count({ where: { ...whereConditions, isFree: false } }),
      Topic.findAll({
        attributes: ["id", "title"],
        include: [
          {
            model: Course,
            as: "courses",
            where: whereConditions,
            attributes: [],
            through: { attributes: [] },
          },
        ],
        group: ["Topic.id", "Topic.title"],
      }).then((topics) => topics.map((topic) => topic.toJSON())),
    ]);

    return {
      courses,
      total: totalFiltered,
      currentPage: page,
      totalPages: Math.ceil(totalFiltered / limit),
      topics,
      stats: { total: totalFiltered, free: freeCount, paid: paidCount },
    };
  }

  // ADMIN: Get course by ID or slug
  async getCourseById(identifier) {
    const whereClause = !isNaN(identifier)
      ? { id: identifier }
      : { slug: identifier };

    const course = await Course.findOne({
      where: whereClause,
      attributes: [
        "id",
        "title",
        "slug",
        "description",
        "teacherId",
        "price",
        "discount",
        "isFree",
        "purpose",
        "thumbnail",
        "content",
        "group",
        "introVideo",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email", "avatar"],
        },
        {
          model: CourseOutline,
          as: "outlines",
          attributes: ["id", "title", "slug"],
        },
        {
          model: Topic,
          as: "topics",
          attributes: ["id", "title"],
          through: { attributes: [] },
        },
        {
          model: User,
          as: "students",
          attributes: ["id", "name", "email"],
          through: { attributes: ["createdAt"] },
        },
      ],
    });

    if (!course) {
      throw new Error("Course not found");
    }
    return course;
  }

  // ADMIN: Create course
  async createCourse(courseData) {
    const {
      title,
      description,
      teacherId,
      price,
      discount,
      isFree = false,
      purpose,
      group,
      content,
      thumbnail,
      introVideo,
    } = courseData;

    if (teacherId) {
      const teacher = await User.findByPk(teacherId);
      if (!teacher) throw new Error("Teacher not found");
    }

    const slug = await generateUniqueSlug(title, Course);

    const course = await Course.create({
      title,
      slug,
      description,
      teacherId,
      price: isFree ? null : price,
      discount,
      isFree,
      purpose,
      group,
      content,
      thumbnail,
      introVideo,
    });

    return await this.getCourseById(course.id);
  }

  // ADMIN: Update course
  async updateCourse(id, courseData) {
    const course = await Course.findByPk(id);
    if (!course) throw new Error("Course not found");

    const {
      title,
      description,
      teacherId,
      price,
      discount,
      isFree,
      purpose,
      group,
      content,
      thumbnail,
      introVideo,
    } = courseData;

    if (teacherId && teacherId !== course.teacherId) {
      const teacher = await User.findByPk(teacherId);
      if (!teacher) throw new Error("Teacher not found");
    }

    let updateData = {
      description,
      teacherId,
      price: isFree ? null : price,
      discount,
      isFree,
      purpose,
      group,
      content,
      thumbnail,
      introVideo,
    };

    if (title && title !== course.title) {
      updateData.title = title;
      updateData.slug = await generateUniqueSlug(title, Course, id);
    }

    await course.update(updateData);
    return await this.getCourseById(id);
  }

  // ADMIN: Delete course
  async deleteCourse(id) {
    const course = await Course.findByPk(id);
    if (!course) throw new Error("Course not found");
    await course.destroy();
    return true;
  }

  // ADMIN: Analytics
  async getCoursesAnalytics() {
    const [
      totalCourses,
      freeCourses,
      paidCourses,
      totalEnrollments,
      totalRevenue,
      coursesByGroup,
    ] = await Promise.all([
      Course.count(),
      Course.count({ where: { isFree: true } }),
      Course.count({ where: { isFree: false } }),
      CourseUser.count(),
      Course.sum("price", { where: { isFree: false } }),
      Course.findAll({
        attributes: ["group", [sequelize.fn("COUNT", "id"), "count"]],
        where: { group: { [Op.not]: null } },
        group: ["group"],
        raw: true,
      }),
    ]);

    return {
      total: totalCourses,
      free: freeCourses,
      paid: paidCourses,
      totalStudents: totalEnrollments,
      totalRevenue: totalRevenue || 0,
      categories: coursesByGroup.length,
      coursesByCategory: coursesByGroup,
    };
  }

  // ADMIN: Course outlines
  async getCourseOutlines(courseId) {
    const course = await Course.findByPk(courseId);
    if (!course) throw new Error("Course not found");

    return await CourseOutline.findAll({
      where: { courseId },
      order: [
        ["order", "ASC"],
        ["createdAt", "ASC"],
      ],
    });
  }

  async createCourseOutline(courseId, outlineData) {
    const course = await Course.findByPk(courseId);
    if (!course) throw new Error("Course not found");

    const { title } = outlineData;
    const slug = await generateUniqueSlug(title, CourseOutline);

    return await CourseOutline.create({
      title,
      slug,
      courseId,
    });
  }

  // ADMIN: Topic assignment
  async assignTopicsToCourse(courseId, topicIds) {
    const course = await Course.findByPk(courseId);
    if (!course) throw new Error("Course not found");

    const topics = await Topic.findAll({
      where: { id: { [Op.in]: topicIds } },
    });

    if (topics.length !== topicIds.length) {
      throw new Error("One or more topics not found");
    }

    await course.setTopics(topics);
    return true;
  }
}

module.exports = new CourseService();
