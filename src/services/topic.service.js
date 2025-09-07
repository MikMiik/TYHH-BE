const { Topic } = require("@/models");

class TopicService {
  async getAll({ limit, offset }) {
    const topics = await Topic.findAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "title", "slug"],
    });
    return topics;
  }
}

module.exports = new TopicService();
