const { Livestream, Course, CourseOutline } = require("@/models");
const { Op } = require("sequelize");
const generateUniqueSlug = require("@/utils/generateUniqueSlug");

class AdminLivestreamService {
  async getAllLivestreams({ page = 1, limit = 10, search, courseId }) {
    const offset = (page - 1) * limit;
    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [{ title: { [Op.like]: `%${search}%` } }];
    }

    if (courseId) {
      whereConditions.courseId = courseId;
    }

    const { count: total, rows: livestreams } =
      await Livestream.findAndCountAll({
        where: whereConditions,
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
          { model: Course, as: "course", attributes: ["id", "title", "slug"] },
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

    const [totalFiltered, totalViews] = await Promise.all([
      Livestream.count({ where: whereConditions }),
      Livestream.sum("view", { where: whereConditions }) || 0,
    ]);

    return {
      items: livestreams,
      pagination: {
        currentPage: page,
        perPage: limit,
        total: totalFiltered,
        lastPage: Math.ceil(totalFiltered / limit),
      },
      stats: { total: totalFiltered, totalViews: totalViews || 0 },
    };
  }

  async getLivestreamById(identifier) {
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
        { model: Course, as: "course", attributes: ["id", "title", "slug"] },
        {
          model: CourseOutline,
          as: "courseOutline",
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

  async createLivestream(livestreamData) {
    const { title, courseId, courseOutlineId, url } = livestreamData;

    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    const courseOutline = await CourseOutline.findOne({
      where: { id: courseOutlineId, courseId },
    });
    if (!courseOutline) {
      throw new Error(
        "Course outline not found or doesn't belong to the specified course"
      );
    }

    const slug = await generateUniqueSlug(title, Livestream);
    const livestream = await Livestream.create({
      title,
      slug,
      courseId,
      courseOutlineId,
      url,
      view: 0,
    });

    return await this.getLivestreamById(livestream.id);
  }

  async updateLivestream(id, livestreamData) {
    const livestream = await Livestream.findByPk(id);
    if (!livestream) {
      throw new Error("Livestream not found");
    }

    const { title, courseId, courseOutlineId, url } = livestreamData;
    let slug = livestream.slug;

    if (title && title !== livestream.title) {
      slug = await generateUniqueSlug(title, Livestream, livestream.id);
    }

    await livestream.update({
      title: title || livestream.title,
      slug,
      courseId: courseId || livestream.courseId,
      courseOutlineId: courseOutlineId || livestream.courseOutlineId,
      url: url !== undefined ? url : livestream.url,
    });

    return await this.getLivestreamById(id);
  }

  async deleteLivestream(id) {
    const livestream = await Livestream.findByPk(id);
    if (!livestream) {
      throw new Error("Livestream not found");
    }
    await livestream.destroy();
    return { message: "Livestream deleted successfully" };
  }
}

module.exports = new AdminLivestreamService();
