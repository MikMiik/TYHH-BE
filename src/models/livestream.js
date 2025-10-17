"use strict";
const getCurrentUserId = require("@/utils/getCurrentUserId");

const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Livestream extends Model {
    static associate(models) {
      Livestream.belongsTo(models.Course, {
        foreignKey: "courseId",
        as: "course",
      });
      Livestream.belongsTo(models.CourseOutline, {
        foreignKey: "courseOutlineId",
        as: "courseOutline",
      });
      Livestream.hasMany(models.Document, {
        foreignKey: "livestreamId",
        as: "documents",
      });
      Livestream.hasMany(models.UserLivestream, {
        foreignKey: "livestreamId",
        as: "userLivestreams",
      });
    }
  }
  Livestream.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      title: { type: DataTypes.STRING(255), allowNull: false },
      slug: { type: DataTypes.STRING(255), allowNull: true, unique: true },
      order: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null },
      courseId: { type: DataTypes.INTEGER, allowNull: false },
      courseOutlineId: { type: DataTypes.INTEGER, allowNull: false },
      url: { type: DataTypes.STRING(255), allowNull: true },
      view: { type: DataTypes.BIGINT, defaultValue: 0 },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      isSeen: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("isSeen");
        },
        set(value) {
          this.setDataValue("isSeen", value);
        },
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "Livestream",
      tableName: "livestreams",
      timestamps: true,
      paranoid: true,
    }
  );

  Livestream.addHook("afterFind", async (result, options) => {
    if (options?.skipIsSeen) return;
    const userId = getCurrentUserId();

    const { UserLivestream } = sequelize.models;

    const livestreams = Array.isArray(result) ? result : result ? [result] : [];
    if (livestreams.length === 0) return;

    // Only process Sequelize model instances
    const validLivestreams = livestreams.filter(
      (livestream) =>
        livestream && typeof livestream.setDataValue === "function"
    );

    if (!userId) {
      validLivestreams.forEach((p) => p.setDataValue("isSeen", false));
    } else {
      const livestreamIds = validLivestreams.map((p) => p.id);

      const userLivestreams = await UserLivestream.findAll({
        where: {
          userId,
          livestreamId: livestreamIds,
        },
      });
      const seenIds = new Set(userLivestreams.map((l) => l.livestreamId));

      validLivestreams.forEach((p) => {
        p.setDataValue("isSeen", seenIds.has(p.id));
      });
    }
  });
  return Livestream;
};
