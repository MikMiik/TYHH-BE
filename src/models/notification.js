"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      // Notification belongs to Teacher (User)
      Notification.belongsTo(models.User, {
        foreignKey: "teacherId",
        as: "teacher",
      });
    }
  }
  Notification.init(
    {
      title: { type: DataTypes.STRING(191), allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: true },
      teacherId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
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
