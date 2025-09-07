"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Schedule extends Model {
    static associate(models) {}
  }
  Schedule.init(
    {
      target: { type: DataTypes.STRING(100), allowNull: true },
      url: { type: DataTypes.STRING(255), allowNull: true },
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
