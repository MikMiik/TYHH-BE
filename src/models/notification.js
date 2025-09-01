"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {}
  }
  Notification.init(
    {
      title: { type: DataTypes.STRING(191), allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: true },
      type: { type: DataTypes.STRING(50), allowNull: true },
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
      modelName: "Notification",
      tableName: "notifications",
      timestamps: true,
      paranoid: true,
    }
  );
  return Notification;
};
