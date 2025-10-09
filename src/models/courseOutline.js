"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CourseOutline extends Model {
    static associate(models) {
      CourseOutline.belongsTo(models.Course, {
        foreignKey: "courseId",
        as: "course",
      });
      CourseOutline.hasMany(models.Livestream, {
        foreignKey: "courseOutlineId",
        as: "livestreams",
      });
    }
  }
  CourseOutline.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: { type: DataTypes.STRING(255), allowNull: false },
      slug: { type: DataTypes.STRING(255), allowNull: true, unique: true },
      order: { type: DataTypes.INTEGER },
      courseId: { type: DataTypes.INTEGER, allowNull: false },
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
