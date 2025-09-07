const { Topic } = require("@/models");
const throw404 = require("@/utils/throw404");

exports.getAll = async (req, res) => {
  const topics = await Topic.findAll({ attributes: ["id", "title"] });
  if (!topics) throw404("Topics not found");
  res.success(200, topics);
};
