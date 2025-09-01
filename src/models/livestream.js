"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Livestream extends Model {
    static associate(models) {}
  }
  Livestream.init(
    {
      title: { type: DataTypes.STRING(191), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      url: { type: DataTypes.STRING(255), allowNull: false },
      startTime: { type: DataTypes.DATE, allowNull: false },
      endTime: { type: DataTypes.DATE, allowNull: true },
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
      modelName: "Livestream",
      tableName: "livestreams",
      timestamps: true,
      paranoid: true,
    }
  );
  return Livestream;
};
