"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SiteInfo extends Model {
    static associate(models) {}
  }
  SiteInfo.init(
    {
      key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      value: { type: DataTypes.TEXT, allowNull: true },
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
      modelName: "SiteInfo",
      tableName: "site-info",
      timestamps: true,
      paranoid: true,
    }
  );
  return SiteInfo;
};
