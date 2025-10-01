const { Topic, Course, CourseTopic, sequelize } = require("@/models");
const { Op } = require("sequelize");
const generateUniqueSlug = require("@/utils/generateUniqueSlug");

class TopicService {
  async getAll({ limit, offset }) {
    const topics = await Topic.findAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "title", "slug", "createdAt"],
      include: [
        {
          association: "courses",
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
          ],
          through: { attributes: [] },
          include: [
            {
              association: "teacher",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });
    return topics;
  }

  // ADMIN: Get all topics (with pagination and search)
  async getAllAdmin({ page = 1, limit = 10, search }) {
    const offset = (page - 1) * limit;
    const whereConditions = {};

    if (search) {
      whereConditions.title = { [Op.like]: `%${search}%` };
    }

    const { count, rows } = await Topic.findAndCountAll({
      where: whereConditions,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "title", "slug", "createdAt", "updatedAt"],
      include: [
        {
          model: Course,
          as: "courses",
          attributes: ["id"],
          through: { attributes: [] },
        },
      ],
    });

    // Add course count to each topic
    const topics = rows.map((topic) => ({
      ...topic.toJSON(),
      courseCount: topic.courses?.length || 0,
    }));

    return {
      topics,
      total: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit),
    };
  }

  // ADMIN: Get topic by ID
  async getTopicById(id) {
    const topic = await Topic.findByPk(id, {
      attributes: ["id", "title", "slug", "createdAt", "updatedAt"],
      include: [
        {
          model: Course,
          as: "courses",
          attributes: ["id", "title", "slug", "price", "isFree", "createdAt"],
          through: { attributes: [] },
          include: [
            {
              association: "teacher",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });

    if (!topic) {
      throw new Error("Topic not found");
    }

    return {
      ...topic.toJSON(),
      courseCount: topic.courses?.length || 0,
    };
  }

  // ADMIN: Create topic
  async createTopic({ title }) {
    const slug = await generateUniqueSlug(title, Topic);

    const topic = await Topic.create({
      title,
      slug,
    });

    return topic;
  }

  // ADMIN: Update topic
  async updateTopic(id, { title }) {
    const topic = await Topic.findByPk(id);
    if (!topic) {
      throw new Error("Topic not found");
    }

    if (title && title !== topic.title) {
      const slug = await generateUniqueSlug(title, Topic);
      topic.slug = slug;
    }

    topic.title = title;
    await topic.save();

    return topic;
  }

  // ADMIN: Delete topic
  async deleteTopic(id) {
    const topic = await Topic.findByPk(id);
    if (!topic) {
      throw new Error("Topic not found");
    }

    // Check if topic is assigned to any courses
    const courseCount = await CourseTopic.count({
      where: { topicId: id },
    });

    if (courseCount > 0) {
      throw new Error("Cannot delete topic that is assigned to courses");
    }

    await topic.destroy();
    return true;
  }

  // ADMIN: Get topics analytics
  async getTopicsAnalytics() {
    const [totalTopics, totalCourseTopics] = await Promise.all([
      Topic.count(),
      CourseTopic.count(),
    ]);

    // Get topics with course counts
    const topicsWithCounts = await Topic.findAll({
      attributes: [
        "id",
        "title",
        [sequelize.fn("COUNT", sequelize.col("courses.id")), "courseCount"],
      ],
      include: [
        {
          model: Course,
          as: "courses",
          attributes: [],
          through: { attributes: [] },
        },
      ],
      group: ["Topic.id"],
      order: [[sequelize.literal("courseCount"), "DESC"]],
      limit: 10,
    });

    return {
      totalTopics,
      totalCourseTopics,
      averageCoursesPerTopic:
        totalTopics > 0 ? (totalCourseTopics / totalTopics).toFixed(2) : 0,
      topTopics: topicsWithCounts,
    };
  }
}

module.exports = new TopicService();
