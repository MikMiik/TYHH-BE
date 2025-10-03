"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SiteInfo extends Model {
    static associate(models) {}
  }
  SiteInfo.init(
    {
      siteName: { type: DataTypes.STRING(255), allowNull: true },
      companyName: { type: DataTypes.STRING(255), allowNull: true },
      email: { type: DataTypes.STRING(255), allowNull: true },
      taxCode: { type: DataTypes.STRING(50), allowNull: true },
      phone: { type: DataTypes.STRING(50), allowNull: true },
      address: { type: DataTypes.TEXT, allowNull: true },
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
