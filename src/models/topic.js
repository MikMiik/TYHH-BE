"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Topic extends Model {
    static associate(models) {}
  }
  Topic.init(
    {
      name: { type: DataTypes.STRING(191), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
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
      modelName: "Topic",
      tableName: "topics",
      timestamps: true,
      paranoid: true,
    }
  );
  return Topic;
};
