"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Social extends Model {
    static associate(models) {}
  }
  Social.init(
    {
      name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      icon: { type: DataTypes.STRING(191), allowNull: true },
      url: { type: DataTypes.STRING(191), allowNull: true },
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
