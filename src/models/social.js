"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Social extends Model {
    static associate(models) {}
  }
  Social.init(
    {
      platform: { type: DataTypes.STRING(100), allowNull: false },
      url: { type: DataTypes.STRING(255), allowNull: false },
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
      modelName: "Social",
      tableName: "socials",
      timestamps: true,
      paranoid: true,
    }
  );
  return Social;
};
