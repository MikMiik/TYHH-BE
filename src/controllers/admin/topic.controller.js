const topicService = require("@/services/topic.service");

exports.getAll = async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const pageNum = isNaN(+page) ? 1 : +page;
  const limitNum = isNaN(+limit) ? 10 : +limit;

  const data = await topicService.getAllAdmin({
    page: pageNum,
    limit: limitNum,
    search,
  });

  res.success(200, data);
};

exports.getOne = async (req, res) => {
  const topic = await topicService.getTopicById(req.params.id);
  res.success(200, topic);
};

exports.create = async (req, res) => {
  const { title } = req.body;
  const topic = await topicService.createTopic({ title });
  res.success(201, topic, "Topic created successfully");
};

exports.update = async (req, res) => {
  const { title } = req.body;
  const topic = await topicService.updateTopic(req.params.id, { title });
  res.success(200, topic, "Topic updated successfully");
};

exports.delete = async (req, res) => {
  await topicService.deleteTopic(req.params.id);
  res.success(200, null, "Topic deleted successfully");
};

exports.getAnalytics = async (req, res) => {
  const analytics = await topicService.getTopicsAnalytics();
  res.success(200, analytics);
};
