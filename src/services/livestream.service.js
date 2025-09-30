const { Livestream, Course, CourseOutline } = require("../models");
const { Op } = require("sequelize");
const generateUniqueSlug = require("@/utils/generateUniqueSlug");

class LivestreamService {
  // ========== PUBLIC API METHODS ==========

  /**
   * Get livestream by slug for public API
   */
  async getLivestreamBySlug(slug) {
    return await Livestream.findOne({
      where: { slug },
      attributes: ["id", "title", "slug", "url", "view"],
      include: [
        {
          association: "course",
          attributes: ["id"],
          include: [
            {
              association: "outlines",
              attributes: ["id", "title"],
              separate: true,
              order: [["createdAt", "ASC"]],
              include: [
                {
                  association: "livestreams",
                  attributes: ["id", "title", "slug", "url", "view"],
                  separate: true,
                  order: [["createdAt", "ASC"]],
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
        },
      ],
    });
  }

  // ========== ADMIN METHODS ==========

  /**
   * Get all livestreams for admin
   */
  async getAllLivestreamsAdmin({
    page = 1,
    limit = 10,
    search,
    courseId,
    courseOutlineId,
  }) {
    const offset = (page - 1) * limit;
    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } },
      ];
    }

    if (courseId) whereConditions.courseId = courseId;
    if (courseOutlineId) whereConditions.courseOutlineId = courseOutlineId;

    const { count: total, rows: livestreams } =
      await Livestream.findAndCountAll({
        where: whereConditions,
        attributes: [
          "id",
          "title",
          "slug",
          "url",
          "view",
          "courseId",
          "courseOutlineId",
          "createdAt",
          "updatedAt",
        ],
        include: [
          {
            model: Course,
            as: "course",
            attributes: ["id", "title", "slug"],
          },
          {
            model: CourseOutline,
            as: "courseOutline",
            attributes: ["id", "title", "slug"],
          },
        ],
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        distinct: true,
      });

    // Calculate stats
    const totalViews = livestreams.reduce(
      (sum, livestream) => sum + (parseInt(livestream.view) || 0),
      0
    );

    return {
      items: livestreams,
      pagination: {
        currentPage: page,
        perPage: limit,
        total,
        lastPage: Math.ceil(total / limit),
      },
      stats: {
        total,
        totalViews,
      },
    };
  }

  /**
   * Get livestream by ID or slug for admin
   */
  async getLivestreamByIdAdmin(identifier) {
    const query = {
      attributes: [
        "id",
        "title",
        "slug",
        "courseId",
        "courseOutlineId",
        "url",
        "view",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "slug"],
        },
        {
          model: CourseOutline,
          as: "courseOutline",
          attributes: ["id", "title", "slug"],
        },
        {
          association: "documents",
          attributes: ["id", "title", "slug"],
        },
      ],
    };

    const livestream = !isNaN(identifier)
      ? await Livestream.findByPk(identifier, query)
      : await Livestream.findOne({ where: { slug: identifier }, ...query });

    if (!livestream) {
      throw new Error("Livestream not found");
    }

    return livestream;
  }

  /**
   * Create livestream (admin only)
   */
  async createLivestreamAdmin(livestreamData) {
    const { title, url, courseId, courseOutlineId } = livestreamData;

    // Validate course exists
    if (courseId) {
      const course = await Course.findByPk(courseId);
      if (!course) {
        throw new Error("Course not found");
      }
    }

    // Validate course outline exists
    if (courseOutlineId) {
      const courseOutline = await CourseOutline.findByPk(courseOutlineId);
      if (!courseOutline) {
        throw new Error("Course outline not found");
      }
    }

    // Generate unique slug
    const slug = await generateUniqueSlug(title, Livestream);

    const livestream = await Livestream.create({
      title,
      slug,
      url,
      courseId,
      courseOutlineId,
      view: 0,
    });

    // Return livestream with relations
    return await this.getLivestreamByIdAdmin(livestream.id);
  }

  /**
   * Update livestream (admin only)
   */
  async updateLivestreamAdmin(id, livestreamData) {
    const livestream = await Livestream.findByPk(id);
    if (!livestream) {
      throw new Error("Livestream not found");
    }

    const { title, url, courseId, courseOutlineId } = livestreamData;

    // Validate course exists if changing
    if (courseId && courseId !== livestream.courseId) {
      const course = await Course.findByPk(courseId);
      if (!course) {
        throw new Error("Course not found");
      }
    }

    // Validate course outline exists if changing
    if (courseOutlineId && courseOutlineId !== livestream.courseOutlineId) {
      const courseOutline = await CourseOutline.findByPk(courseOutlineId);
      if (!courseOutline) {
        throw new Error("Course outline not found");
      }
    }

    // Generate new slug if title changed
    let updateData = { url, courseId, courseOutlineId };

    if (title && title !== livestream.title) {
      updateData.title = title;
      updateData.slug = await generateUniqueSlug(title, Livestream, id);
    }

    await livestream.update(updateData);
    return await this.getLivestreamByIdAdmin(id);
  }

  /**
   * Delete livestream (admin only)
   */
  async deleteLivestreamAdmin(id) {
    const livestream = await Livestream.findByPk(id);
    if (!livestream) {
      throw new Error("Livestream not found");
    }

    await livestream.destroy();
    return true;
  }

  /**
   * Get livestreams analytics (admin only)
   */
  async getLivestreamsAnalytics() {
    const [totalLivestreams, totalViews, averageViews] = await Promise.all([
      Livestream.count(),
      Livestream.sum("view"),
      Livestream.findOne({
        attributes: [
          [
            require("sequelize").fn("AVG", require("sequelize").col("view")),
            "avgViews",
          ],
        ],
        raw: true,
      }),
    ]);

    return {
      total: totalLivestreams,
      totalViews: totalViews || 0,
      averageViews: Math.round(averageViews?.avgViews || 0),
    };
  }

  /**
   * Increment view count (public)
   */
  async incrementView(id) {
    const livestream = await Livestream.findByPk(id);
    if (!livestream) {
      throw new Error("Livestream not found");
    }

    await livestream.increment("view");
    return true;
  }
}

module.exports = new LivestreamService();
