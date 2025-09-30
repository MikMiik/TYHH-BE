"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Topic extends Model {
    static associate(models) {
      Topic.belongsToMany(models.Course, {
        through: models.CourseTopic,
        foreignKey: "topicId",
        otherKey: "courseId",
        as: "courses",
      });
      // Direct association with CourseTopic
      Topic.hasMany(models.CourseTopic, {
        foreignKey: "topicId",
        as: "CourseTopics",
      });
    }
  }
  Topic.init(
    {
      title: { type: DataTypes.STRING(255), allowNull: false },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
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
      modelName: "Topic",
      tableName: "topics",
      timestamps: true,
      paranoid: true,
    }
  );
  return Topic;
};
