"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserNotification extends Model {
    static associate(models) {
      UserNotification.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
      UserNotification.belongsTo(models.Notification, {
        foreignKey: "notificationId",
        as: "notification",
      });
    }
  }
  UserNotification.init(
    {
      userId: { type: DataTypes.INTEGER, allowNull: false },
      notificationId: { type: DataTypes.INTEGER, allowNull: false },
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
    },
    {
      sequelize,
      modelName: "UserNotification",
      tableName: "user_notification",
      timestamps: true,
      paranoid: false,
    }
  );
  return UserNotification;
};
