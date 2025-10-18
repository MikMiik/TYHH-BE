"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    static associate(models) {
      Course.belongsTo(models.User, {
        foreignKey: "teacherId",
        as: "teacher",
      });
      Course.hasMany(models.CourseOutline, {
        foreignKey: "courseId",
        as: "outlines",
      });
      Course.hasMany(models.Livestream, {
        foreignKey: "courseId",
        as: "livestreams",
      });
      Course.belongsToMany(models.Topic, {
        through: models.CourseTopic,
        foreignKey: "courseId",
        otherKey: "topicId",
        as: "topics",
      });
      // Many-to-many: Course được đăng ký bởi nhiều User
      Course.belongsToMany(models.User, {
        through: models.CourseUser,
        foreignKey: "courseId",
        otherKey: "userId",
        as: "students",
      });
      // Direct association with CourseUser
      Course.hasMany(models.CourseUser, {
        foreignKey: "courseId",
        as: "CourseUsers",
      });
    }
  }
  Course.init(
    {
      title: { type: DataTypes.STRING(255), allowNull: false },
      slug: { type: DataTypes.STRING(255), allowNull: true, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      teacherId: { type: DataTypes.INTEGER, allowNull: true },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      discount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      isFree: { type: DataTypes.BOOLEAN, defaultValue: false },
      purpose: { type: DataTypes.STRING(255), allowNull: true },
      thumbnail: { type: DataTypes.STRING(191), allowNull: true },
      content: { type: DataTypes.TEXT, allowNull: true },
      group: { type: DataTypes.STRING(255), allowNull: true },
      introVideo: { type: DataTypes.STRING(255), allowNull: true },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
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
      modelName: "Course",
      tableName: "courses",
      timestamps: true,
      paranoid: true,
    }
  );
  return Course;
};
