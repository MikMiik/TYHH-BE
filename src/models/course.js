"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    static associate(models) {
      // 1 course thuộc về 1 user
      Course.belongsTo(models.User, {
        foreignKey: "teacherId",
        as: "teacher",
      });
    }
  }
  Course.init(
    {
      title: { type: DataTypes.STRING(255), allowNull: false },
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
