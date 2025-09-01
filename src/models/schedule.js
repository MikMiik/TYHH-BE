"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    static associate(models) {}
  }
  Schedule.init(
    {
      courseId: { type: DataTypes.INTEGER, allowNull: false },
      startTime: { type: DataTypes.DATE, allowNull: false },
      endTime: { type: DataTypes.DATE, allowNull: false },
      location: { type: DataTypes.STRING(191), allowNull: true },
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
      modelName: "Schedule",
      tableName: "schedules",
      timestamps: true,
      paranoid: true,
    }
  );
  return Schedule;
};
