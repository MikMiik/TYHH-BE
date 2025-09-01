"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CourseOutline extends Model {
    static associate(models) {}
  }
  CourseOutline.init(
    {
      courseId: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING(191), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      order: { type: DataTypes.INTEGER, allowNull: true },
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
      modelName: "CourseOutline",
      tableName: "course-outline",
      timestamps: true,
      paranoid: true,
    }
  );
  return CourseOutline;
};
