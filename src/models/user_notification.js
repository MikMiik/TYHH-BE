"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserNotification extends Model {
    static associate(models) {}
  }
  UserNotification.init(
    {
      userId: { type: DataTypes.INTEGER, allowNull: false },
      notificationId: { type: DataTypes.INTEGER, allowNull: false },
      read: { type: DataTypes.BOOLEAN, defaultValue: false },
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
