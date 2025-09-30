"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CourseUser extends Model {
    static associate(models) {
      // Association with User
      CourseUser.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });

      // Association with Course
      CourseUser.belongsTo(models.Course, {
        foreignKey: "courseId",
        as: "course",
      });
    }
  }
  CourseUser.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      courseId: { type: DataTypes.INTEGER, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false },
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
    },
    {
      sequelize,
      modelName: "CourseUser",
      tableName: "course_user",
      timestamps: true,
      paranoid: false,
    }
  );
  return CourseUser;
};
