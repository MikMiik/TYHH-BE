const topicService = require("@/services/topic.service");

exports.getAll = async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;
  const topics = await topicService.getAll({
    limit: limitNum,
    offset: (pageNum - 1) * limitNum,
  });
  res.success(200, topics);
};
