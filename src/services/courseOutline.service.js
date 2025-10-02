const { CourseOutline, Course, Livestream, sequelize } = require("@/models");
const { Op } = require("sequelize");
const generateUniqueSlug = require("@/utils/generateUniqueSlug");

class CourseOutlineService {
  // Get all outlines for a specific course (admin)
  async getAllOutlines({ courseId, page = 1, limit = 10, search }) {
    const offset = (page - 1) * limit;
    let whereClause = { courseId };

    // Search filter
    if (search) {
      whereClause.title = { [Op.like]: `%${search}%` };
    }

    const { count, rows: outlines } = await CourseOutline.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "slug"],
        },
      ],
      limit,
      offset,
      order: [
        ["order", "ASC"],
        ["createdAt", "DESC"],
      ],
    });

    const totalPages = Math.ceil(count / limit);

    return {
      outlines,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
      },
    };
  }

  // Get single outline by ID or slug
  async getOutlineById(identifier) {
    const whereClause = !isNaN(identifier)
      ? { id: identifier }
      : { slug: identifier };

    const outline = await CourseOutline.findOne({
      where: whereClause,
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "slug", "description"],
        },
        {
          model: Livestream,
          as: "livestreams",
          attributes: ["id", "title", "slug", "url", "view"],
          order: [["order", "ASC"]],
        },
      ],
    });

    if (!outline) {
      throw new Error("Course outline not found");
    }

    return outline;
  }

  // Create new outline
  async createOutline(outlineData) {
    const { title, courseId } = outlineData;

    // Verify course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Generate unique slug from title
    const slug = await generateUniqueSlug(title, CourseOutline);

    // Get next order number for this course
    const maxOrder = await CourseOutline.max("order", {
      where: { courseId },
    });
    const nextOrder = (maxOrder || 0) + 1;

    const outline = await CourseOutline.create({
      title,
      slug,
      courseId,
      order: nextOrder,
    });

    // Return with course information
    return await this.getOutlineById(outline.id);
  }

  // Update outline
  async updateOutline(id, outlineData) {
    const outline = await CourseOutline.findByPk(id);
    if (!outline) {
      throw new Error("Course outline not found");
    }

    const { title } = outlineData;
    const updateData = { title };

    // Generate new slug if title changed
    if (title && title !== outline.title) {
      updateData.slug = await generateUniqueSlug(title, CourseOutline);
    }

    await outline.update(updateData);

    // Return updated outline with course information
    return await this.getOutlineById(id);
  }

  // Delete outline (soft delete)
  async deleteOutline(id) {
    const outline = await CourseOutline.findByPk(id);
    if (!outline) {
      throw new Error("Course outline not found");
    }

    const courseId = outline.courseId;
    const deletedOrder = outline.order;

    // Use transaction for atomic delete and reorder
    const transaction = await sequelize.transaction();

    try {
      // Delete the outline
      await outline.destroy({ transaction });

      // Reorder remaining outlines (decrease order by 1 for items after deleted item)
      if (deletedOrder) {
        await CourseOutline.update(
          { order: sequelize.literal("`order` - 1") },
          {
            where: {
              courseId,
              order: { [sequelize.Sequelize.Op.gt]: deletedOrder },
            },
            transaction,
          }
        );
      }

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Failed to delete outline: ${error.message}`);
    }
  }

  // Reorder outlines
  async reorderOutlines(courseId, orders) {
    // Verify course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Validate orders array
    if (!Array.isArray(orders) || orders.length === 0) {
      throw new Error("Invalid orders data");
    }

    // Use transaction for atomic updates
    const transaction = await sequelize.transaction();

    try {
      // Update each outline's order
      const updatePromises = orders.map(({ id, order }) => {
        return CourseOutline.update(
          { order },
          {
            where: { id, courseId },
            transaction,
          }
        );
      });

      await Promise.all(updatePromises);
      await transaction.commit();

      return true;
    } catch (error) {
      await transaction.rollback();
      throw new Error(`Failed to reorder outlines: ${error.message}`);
    }
  }

  // Get all outlines across all courses (for admin overview)
  async getAllOutlinesAcrossCourses(options = {}) {
    const { page = 1, limit = 10, search } = options;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where.title = {
        [Op.like]: `%${search}%`,
      };
    }

    const { count, rows } = await CourseOutline.findAndCountAll({
      where,
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "slug"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      outlines: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    };
  }
}

module.exports = new CourseOutlineService();
