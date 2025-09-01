"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    static associate(models) {}
  }
  Course.init(
    {
      name: { type: DataTypes.STRING(191), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      teacherId: { type: DataTypes.INTEGER, allowNull: true },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      thumbnail: { type: DataTypes.STRING(191), allowNull: true },
      status: { type: DataTypes.STRING(20), allowNull: true },
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
