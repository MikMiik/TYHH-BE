const { Course, User, CourseUser, Topic, CourseOutline } = require("@/models");
const { Op } = require("sequelize");
const { generateUniqueSlug } = require("@/utils/generateUniqueSlug");

class AdminCourseService {
  async getAllCourses({
    page = 1,
    limit = 10,
    search,
    teacherId,
    isFree,
    topicId,
  }) {
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = {};
    const includeConditions = [];

    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    if (teacherId) {
      whereConditions.teacherId = teacherId;
    }

    if (typeof isFree === "boolean") {
      whereConditions.isFree = isFree;
    }

    // Filter by topic if provided
    if (topicId) {
      includeConditions.push({
        model: Topic,
        as: "topics",
        where: { id: topicId },
        attributes: ["id", "title"],
        through: { attributes: [] },
      });
    } else {
      // Include all topics if no filter
      includeConditions.push({
        model: Topic,
        as: "topics",
        attributes: ["id", "title"],
        through: { attributes: [] },
      });
    }

    // Get courses with pagination - sorting will be handled on frontend
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
      order: [["createdAt", "DESC"]], // Default order, FE can sort as needed
      distinct: true,
    });

    // Calculate stats for filtered data
    const statsPromises = await Promise.all([
      Course.count({ where: whereConditions }), // total matching search/filter
      Course.count({ where: { ...whereConditions, isFree: true } }), // free courses matching filter
      Course.count({ where: { ...whereConditions, isFree: false } }), // paid courses matching filter
      // Get unique topics from courses
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
      }).then((topics) => topics.map((topic) => topic.toJSON())), // return topics array
    ]);

    const [totalFiltered, freeCount, paidCount, topics] = statsPromises;

    return {
      courses,
      total: totalFiltered,
      currentPage: page,
      totalPages: Math.ceil(totalFiltered / limit),
      topics, // return available topics
      stats: {
        total: totalFiltered,
        free: freeCount,
        paid: paidCount,
      },
    };
  }

  async getCourseById(identifier) {
    // Try to find by ID first (if it's a number), then by slug
    let course;

    if (!isNaN(identifier)) {
      // It's a number, search by ID
      course = await Course.findByPk(identifier, {
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
            // order removed, sort after fetch if needed
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
    } else {
      // It's a string, search by slug
      course = await Course.findOne({
        where: { slug: identifier },
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
    }

    if (!course) {
      throw new Error("Course not found");
    }

    return course;
  }

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

    // Validate teacher exists
    if (teacherId) {
      const teacher = await User.findByPk(teacherId);
      if (!teacher) {
        throw new Error("Teacher not found");
      }
    }

    // Generate unique slug
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

    // Return course with teacher info
    const createdCourse = await this.getCourseById(course.id);
    return createdCourse;
  }

  async updateCourse(id, courseData) {
    const course = await Course.findByPk(id);
    if (!course) {
      throw new Error("Course not found");
    }

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

    // Validate teacher exists
    if (teacherId && teacherId !== course.teacherId) {
      const teacher = await User.findByPk(teacherId);
      if (!teacher) {
        throw new Error("Teacher not found");
      }
    }

    // Generate new slug if title changed
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

    // Return updated course with relations
    const updatedCourse = await this.getCourseById(id);
    return updatedCourse;
  }

  async deleteCourse(id) {
    const course = await Course.findByPk(id);
    if (!course) {
      throw new Error("Course not found");
    }

    // Soft delete
    await course.destroy();
    return true;
  }

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
        attributes: [
          "group",
          [require("sequelize").fn("COUNT", "id"), "count"],
        ],
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

  // Course Outline Management
  async getCourseOutlines(courseId) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    const outlines = await CourseOutline.findAll({
      where: { courseId },
      order: [
        ["order", "ASC"],
        ["createdAt", "ASC"],
      ],
    });

    return outlines;
  }

  async createCourseOutline(courseId, outlineData) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    const { title } = outlineData;
    const slug = await generateUniqueSlug(title, CourseOutline);

    const outline = await CourseOutline.create({
      title,
      slug,
      courseId,
    });

    return outline;
  }

  // Topic Management
  async assignTopicsToCourse(courseId, topicIds) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Validate all topics exist
    const topics = await Topic.findAll({
      where: { id: { [Op.in]: topicIds } },
    });

    if (topics.length !== topicIds.length) {
      throw new Error("One or more topics not found");
    }

    // Assign topics to course
    await course.setTopics(topics);
    return true;
  }
}

module.exports = new AdminCourseService();
