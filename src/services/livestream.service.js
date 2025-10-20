const {
  Livestream,
  Course,
  CourseOutline,
  Comment,
  User,
} = require("../models");
const { Op } = require("sequelize");
const generateUniqueSlug = require("@/utils/generateUniqueSlug");

class LivestreamService {
  async getLivestreamBySlug(slug) {
    const livestream = await Livestream.findOne({
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
                },
              ],
            },
          ],
        },
        {
          association: "documents",
          attributes: ["id", "slug"],
        },
      ],
    });
    const { rows: comments, count: commentsCount } =
      await Comment.findAndCountAll({
        where: {
          commentableId: livestream.id,
          commentableType: "livestream",
        },
        attributes: [
          "id",
          "parentId",
          "content",
          "isEdited",
          "likesCount",
          "createdAt",
          "updatedAt",
        ],
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: User,
            as: "commenter",
            attributes: ["id", "username", "avatar", "name"],
          },
          {
            model: Comment,
            as: "parent",
            attributes: ["id", "content"],
            include: [
              {
                model: User,
                as: "commenter",
                attributes: ["id", "name", "username"],
              },
            ],
          },
        ],
      });
    return { livestream, comments, commentsCount };
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

    // Calculate next order value for the course
    const maxOrderLivestream = await Livestream.findOne({
      where: { courseId },
      order: [["order", "DESC"]],
      attributes: ["order"],
    });

    const nextOrder = maxOrderLivestream?.order
      ? maxOrderLivestream.order + 1
      : 1;

    // Generate unique slug
    const slug = await generateUniqueSlug(title, Livestream);

    const livestream = await Livestream.create({
      title,
      slug,
      url,
      courseId,
      courseOutlineId,
      order: nextOrder,
      view: 0,
    });

    // Return livestream with relations
    return await this.getLivestreamByIdAdmin(livestream.id);
  }

  /**
   * Update livestream (admin only)
   */
  async updateLivestream(id, livestreamData) {
    const livestream = await Livestream.findByPk(id);
    if (!livestream) {
      throw new Error("Livestream not found");
    }

    const { title, url, courseId, courseOutlineId, order } = livestreamData;

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

    // Include order if provided
    if (order !== undefined && order !== null) {
      updateData.order = order;
    }

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

  // Bulk delete livestreams
  async bulkDeleteLivestreams(ids) {
    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("IDs array is required and must not be empty");
    }

    const deletedRowsCount = await Livestream.destroy({
      where: { id: { [Op.in]: ids } },
    });

    return {
      deletedCount: deletedRowsCount,
      message: `Successfully deleted ${deletedRowsCount} livestream(s)`,
    };
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

  /**
   * Reorder livestreams within a course outline
   */
  async reorderLivestreams(courseOutlineId, orders) {
    const { sequelize } = require("../models");

    try {
      console.log("🔄 Reorder livestreams started:", {
        courseOutlineId,
        orders,
      });

      // Validate course outline exists
      const courseOutline = await CourseOutline.findByPk(courseOutlineId);
      if (!courseOutline) {
        throw new Error("Course outline not found");
      }

      // Get all livestream IDs that will be reordered
      const livestreamIds = orders.map(({ id }) => id);
      console.log("📋 Livestream IDs to reorder:", livestreamIds);

      // Verify all livestreams belong to this course outline
      const existingLivestreams = await Livestream.findAll({
        where: {
          id: livestreamIds,
          courseOutlineId,
        },
        attributes: ["id", "title", "order"],
      });

      console.log(
        "🔍 Existing livestreams found:",
        existingLivestreams.map((l) => ({
          id: l.id,
          title: l.title,
          currentOrder: l.order,
        }))
      );

      if (existingLivestreams.length !== livestreamIds.length) {
        throw new Error(
          "Some livestreams not found or don't belong to this course outline"
        );
      }

      // Use transaction for safer updates
      const transaction = await sequelize.transaction();

      try {
        // Method 1: Update one by one with clear logging
        for (const { id, order } of orders) {
          console.log(`🔄 Updating livestream ${id} to order ${order}`);

          const result = await Livestream.update(
            { order },
            {
              where: {
                id,
                courseOutlineId,
              },
              transaction,
            }
          );

          console.log(
            `✅ Updated livestream ${id}, affected rows: ${result[0]}`
          );
        }

        await transaction.commit();
        console.log("✅ Transaction committed successfully");
        return true;
      } catch (transactionError) {
        await transaction.rollback();
        throw transactionError;
      }
    } catch (error) {
      console.error("❌ Reorder error:", error);
      console.error("❌ Error details:", {
        message: error.message,
        name: error.name,
        sql: error.sql,
        original: error.original,
      });
      throw new Error(`Failed to reorder livestreams: ${error.message}`);
    }
  }
}

module.exports = new LivestreamService();
