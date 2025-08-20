const posts = await Post.findAll();

for (const post of posts) {
  const count = await Like.count({
    where: {
      likableId: post.id,
      likableType: "Post",
    },
  });

  post.likesCount = count;
  await post.save();
}
