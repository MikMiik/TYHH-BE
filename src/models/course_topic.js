"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CourseTopic extends Model {
    static associate(models) {}
  }
  CourseTopic.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      courseId: { type: DataTypes.INTEGER, allowNull: false },
      topicId: { type: DataTypes.INTEGER, allowNull: false },
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
      modelName: "CourseTopic",
      tableName: "course_topic",
      timestamps: true,
      paranoid: false,
    }
  );
  return CourseTopic;
};
