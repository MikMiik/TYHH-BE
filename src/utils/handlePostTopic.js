const { Topic, Post_Topic } = require("@/models");

async function handlePostTopic({ postId, topicNames }) {
  if (!topicNames || topicNames?.length === 0) return;

  const uniqueNames = [...new Set(topicNames.map((name) => name.trim()))];

  const existingTopics = await Topic.findAll({
    where: {
      name: uniqueNames,
    },
  });

  const existingNames = existingTopics.map((t) => t.name);
  const existingIds = existingTopics.map((t) => t.id);

  // Tìm các topic chưa tồn tại
  const missingNames = uniqueNames.filter(
    (name) => !existingNames.includes(name)
  );

  // Tạo mới các topic còn thiếu
  const newTopics = await Promise.all(
    missingNames.map((name) => Topic.create({ name }))
  );

  const newIds = newTopics.map((t) => t.id);

  // Tổng hợp tất cả topicId
  const allTopicIds = [...existingIds, ...newIds];

  // Xóa các topic cũ của post trước khi thêm mới
  await Post_Topic.destroy({
    where: { postId },
  });

  // Tạo các bản ghi trong bảng PostTopic
  await Promise.all(
    allTopicIds.map((topicId) =>
      Post_Topic.create({
        postId,
        topicId,
      })
    )
  );
}

module.exports = handlePostTopic;
