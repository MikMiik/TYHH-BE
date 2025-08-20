const { Like } = require("@/models");

async function setIslikedPosts(posts, currentUserId) {
  // Lấy toàn bộ likes của user hiện tại với bài post
  const likes = await Like.findAll({
    where: {
      userId: currentUserId,
      likableType: "Post",
      likableId: posts.map((p) => p.id),
    },
  });

  const likedPostIds = new Set(likes.map((l) => l.likableId));

  // Gán isLiked
  const result = posts.map((post) => {
    post.setDataValue("isLiked", likedPostIds.has(post.id));
    return post;
  });

  return result;
}

module.exports = setIslikedPosts;
