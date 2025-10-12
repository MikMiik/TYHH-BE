const { Comment, User, Like, sequelize } = require("@/models");
const getCurrentUserId = require("@/utils/getCurrentUserId");
const { Op } = require("sequelize");
class CommentsService {
  // Getter for current user ID
  get userId() {
    return getCurrentUserId();
  }

  async getAll() {
    const comments = await Comment.findAll({
      attributes: [
        "id",
        "userId",
        "content",
        "parentId",
        "likesCount",
        "deletedAt",
        "createdAt",
        "updatedAt",
      ],
    });
    return comments;
  }

  async getById(id) {
    const comment = await Comment.findOne({
      where: { id },
      attributes: [
        "id",
        "userId",
        "content",
        "formattedContent",
        "parentId",
        "likesCount",
        "deletedAt",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: User,
          as: "commenter",
          attributes: ["id", "name", "username", "avatar"],
        },
        {
          model: Comment,
          as: "parent",
          attributes: ["id", "content"],
          include: [
            {
              model: User,
              as: "commenter",
              attributes: ["id", "name", "username", "avatar"],
            },
          ],
        },
      ],
    });
    return comment;
  }

  async create(data) {
    const comment = await Comment.create(data, {});
    const fullComment = await Comment.findOne({
      where: {
        [Op.or]: [{ id: comment.id }],
      },
      attributes: [
        "id",
        "parentId",
        "content",
        "formattedContent",
        "likesCount",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: User,
          as: "commenter",
          attributes: ["id", "name", "username", "avatar"],
        },
        {
          model: Comment,
          as: "parent",
          attributes: ["id", "content"],
          include: [
            {
              model: User,
              as: "commenter",
              attributes: ["id", "name", "username", "avatar"],
            },
          ],
        },
      ],
    });

    return fullComment;
  }

  async update(id, data) {
    const comment = await Comment.update(data, { where: { id } });
    return comment;
  }

  async likeComment(commentId) {
    try {
      const userId = this.userId;

      await sequelize.transaction(async (t) => {
        // Get user info for notification
        const user = await User.findOne({
          where: { id: userId },
          attributes: ["id", "avatar", "name"],
          transaction: t,
        });

        // Get comment info to find the comment owner
        const comment = await Comment.findOne({
          where: { id: commentId },
          attributes: ["userId"],
          transaction: t,
        });

        const existing = await Like.findOne({
          where: { userId, likableId: commentId, likableType: "Comment" },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (existing) {
          throw new Error("You have already liked this comment");
        }

        const like = await Like.create(
          { userId, likableId: commentId, likableType: "Comment" },
          { transaction: t }
        );

        await Comment.increment("likesCount", {
          by: 1,
          where: { id: commentId },
          transaction: t,
        });
      });

      return { message: "Comment liked" };
    } catch (error) {
      if (
        error.name === "SequelizeUniqueConstraintError" ||
        error.message === "You have already liked this comment"
      ) {
        return { message: error.message };
      }
      throw error;
    }
  }

  async unlikeComment(commentId) {
    try {
      const userId = this.userId;

      await sequelize.transaction(async (t) => {
        const existing = await Like.findOne({
          where: { userId, likableId: commentId, likableType: "Comment" },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!existing) {
          throw new Error("You have not liked this comment yet");
        }

        await existing.destroy({ transaction: t });

        await Comment.decrement("likesCount", {
          by: 1,
          where: { id: commentId },
          transaction: t,
        });
      });

      return { message: "Comment unliked" };
    } catch (error) {
      if (
        error.name === "SequelizeUniqueConstraintError" ||
        error.message === "You have not liked this comment yet"
      ) {
        return { message: error.message };
      }
      throw error;
    }
  }

  async delete(id) {
    await Comment.destroy({ where: { id } });
  }
}

module.exports = new CommentsService();
