"use strict";
const getCurrentUserId = require("@/utils/getCurrentUserId");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
      Comment.belongsTo(models.Livestream, {
        foreignKey: "commentableId",
        constraints: false,
        as: "livestream",
      });
      Comment.belongsTo(models.User, { as: "commenter", foreignKey: "userId" });
      Comment.hasMany(Comment, {
        as: "replies",
        foreignKey: "parentId",
      });
      Comment.belongsTo(Comment, {
        as: "parent",
        foreignKey: "parentId",
      });
      Comment.hasMany(models.Like, {
        foreignKey: "likableId",
        constraints: false,
        scope: {
          likableType: "Comment",
        },
        as: "likes",
      });
    }
  }
  Comment.init(
    {
      userId: DataTypes.INTEGER,

      parentId: DataTypes.INTEGER,

      content: DataTypes.TEXT,

      formattedContent: {
        type: DataTypes.VIRTUAL,
      },

      livestreamId: DataTypes.INTEGER,

      commentableType: DataTypes.STRING(191),

      likesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      isLiked: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("isLiked");
        },
        set(value) {
          this.setDataValue("isLiked", value);
        },
      },

      isEdited: DataTypes.BOOLEAN,

      createdAt: DataTypes.DATE,

      updatedAt: DataTypes.DATE,

      deletedAt: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Comment",
      tableName: "comments",
      timestamps: true,
      paranoid: true,
    }
  );

  //Handle isLiked
  Comment.addHook("afterFind", async (result, options) => {
    if (options?.skipHandleIsLiked) return;

    const userId = getCurrentUserId();
    const { Like } = sequelize.models;

    // Đảm bảo luôn xử lý mảng
    const comments = Array.isArray(result) ? result : result ? [result] : [];

    if (comments.length === 0) return;

    if (!userId) {
      comments.forEach((c) => c.setDataValue("isLiked", false));
    } else {
      const commentIds = comments.map((c) => c.id);

      const likes = await Like.findAll({
        where: {
          userId,
          likableType: "Comment",
          likableId: commentIds,
        },
      });

      const likedIds = new Set(likes.map((l) => l.likableId));
      comments.forEach((c) => {
        c.setDataValue("isLiked", likedIds.has(c.id));
      });
    }
  });
  return Comment;
};
