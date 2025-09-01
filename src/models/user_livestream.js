"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserLivestream extends Model {
    static associate(models) {}
  }
  UserLivestream.init(
    {
      userId: { type: DataTypes.INTEGER, allowNull: false },
      livestreamId: { type: DataTypes.INTEGER, allowNull: false },
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
      modelName: "UserLivestream",
      tableName: "user_livestream",
      timestamps: true,
      paranoid: false,
    }
  );
  return UserLivestream;
};
