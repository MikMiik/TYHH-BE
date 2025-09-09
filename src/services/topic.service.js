const { Topic } = require("@/models");

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
}

module.exports = new TopicService();
